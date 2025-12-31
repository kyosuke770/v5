/*************************************************
 * Keys
 *************************************************/
const SRS_KEY   = "srs_levels_v2";
const DAILY_KEY = "daily_levels_v2";
const PREF_KEY  = "prefs_levels_v2";

/*************************************************
 * Time
 *************************************************/
const MIN  = 60 * 1000;
const HOUR = 60 * MIN;
const DAY  = 24 * HOUR;
const now  = () => Date.now();

/*************************************************
 * 3段階SRS（again/hard/easy）
 * - again/hard は due に追加
 * - easy はクリア扱い（due除外）
 *************************************************/
function nextIntervalMs(grade) {
  // grade: 1 again, 2 hard, 3 easy
  switch (grade) {
    case 1: return 5 * MIN;     // again
    case 2: return 6 * HOUR;    // hard
    case 3: return 12 * DAY;    // easy（使わないが保険）
    default: return 6 * HOUR;
  }
}

/*************************************************
 * Load/Save
 *************************************************/
let srs = JSON.parse(localStorage.getItem(SRS_KEY) || "{}");
// srs[no] = { 1:{...}, 2:{...}, 3:{...} }  // level別

let daily = JSON.parse(localStorage.getItem(DAILY_KEY) || "null") || {
  day: new Date().toDateString(),
  goodCount: 0,
  goal: 10
};

let prefs = JSON.parse(localStorage.getItem(PREF_KEY) || "null") || {
  level: 1,
  block: 1
};

function saveAll() {
  localStorage.setItem(SRS_KEY, JSON.stringify(srs));
  localStorage.setItem(DAILY_KEY, JSON.stringify(daily));
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

function ensureDaily() {
  const today = new Date().toDateString();
  if (daily.day !== today) {
    daily.day = today;
    daily.goodCount = 0;
    saveAll();
  }
}

/*************************************************
 * State
 *************************************************/
let cards = [];
let cardsByMode = [];
let index = 0;

let revealed = false;
let showNote = false;
let currentAnswer = "";

// 周回管理（1周で終わる → 残り復習のみ2周目）
let loop = 1;        // 1 or 2
let baseSet = [];    // 1周目の集合

/*************************************************
 * DOM
 *************************************************/
const homeView = document.getElementById("homeView");
const studyView = document.getElementById("studyView");

const homeVideoBtn = document.getElementById("homeVideo");
const homeWeakBtn  = document.getElementById("homeWeak");
const homeDueAllBtn   = document.getElementById("homeDueAll");
const homeDueBlockBtn = document.getElementById("homeDueBlock");

const backHomeBtn = document.getElementById("backHome");
const videoBtn = document.getElementById("videoOrder");
const nextBtn = document.getElementById("next");
const reviewBtn = document.getElementById("review");

const jpEl = document.getElementById("jp");
const enEl = document.getElementById("en");
const cardEl = document.getElementById("card");
const noteEl = document.getElementById("noteText");
const statsEl = document.getElementById("statsText");
const loopEl  = document.getElementById("loopText");

const g1 = document.getElementById("g1");
const g2 = document.getElementById("g2");
const g3 = document.getElementById("g3");

const lv1Btn = document.getElementById("lv1Btn");
const lv2Btn = document.getElementById("lv2Btn");
const lv3Btn = document.getElementById("lv3Btn");

const dueAllText   = document.getElementById("dueAllText");
const dueBlockText = document.getElementById("dueBlockText");
const weakText     = document.getElementById("weakText");

/*************************************************
 * Views
 *************************************************/
function showHome() {
  homeView.classList.remove("hidden");
  studyView.classList.add("hidden");
  renderDaily();
  renderProgress();
  renderBlockTable();
  renderSceneButtons();
  renderHomeDue();
}

function showStudy() {
  homeView.classList.add("hidden");
  studyView.classList.remove("hidden");
  renderLevelButtons();
  render();
}

function resetCardView() {
  revealed = false;
  showNote = false;
}

/*************************************************
 * CSV Auto Loader (manifest不要)
 * 期待する命名規則:
 *   ./data/video01_001-030.csv
 *   ./data/video01_031-060.csv
 *   ...
 *************************************************/
function pad2(n){ return String(n).padStart(2, "0"); }
function pad3(n){ return String(n).padStart(3, "0"); }

async function loadAllCSVs() {
  cards = [];

  const MAX_VIDEO = 50;
  const MAX_BLOCK = 50; // 1動画あたり最大ブロック数（30問単位）

  for (let v = 1; v <= MAX_VIDEO; v++) {
    for (let b = 0; b < MAX_BLOCK; b++) {
      const start = b * 30 + 1;
      const end = start + 29;

      const file = `./data/video${pad2(v)}_${pad3(start)}-${pad3(end)}.csv`;

      try {
        const res = await fetch(file, { cache: "no-store" });
        if (!res.ok) continue;

        const text = await res.text();
        // HTMLを誤読しない
        if (text.trim().startsWith("<!DOCTYPE") || text.includes("<html")) continue;

        const parsed = parseCSV(text);
        if (parsed.length) {
          cards.push(...parsed);
          console.log("Loaded:", file, parsed.length);
        }
      } catch (_) {
        // 404想定：無視
      }
    }
  }

  if (!cards.length) {
    alert("csvが1件も読み込めませんでした（/data のファイル名/場所/ヘッダを確認）");
    return;
  }

  // noで整列
  cards.sort((a, b) => a.no - b.no);

  // 初期：選択中ブロック
  cardsByMode = getCardsByBlock(prefs.block || 1);
  baseSet = [...cardsByMode];
  loop = 1;
  index = 0;
  resetCardView();

  showHome();
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  lines.shift(); // header 제거

  return lines
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const cols = splitCSV(line);

      const no = Number(cols[0]);
      const jp = cols[1] || "";
      const en = cols[2] || "";
      const slotsRaw = cols[3] || "";
      const video = cols[4] || "";
      const lv = Number(cols[5] || "1");
      const note = cols[6] || "";
      const scene = cols[7] || "";

      let slots = null;
      // slots: "jp=en|jp2=en2"
      if (slotsRaw) {
        slots = slotsRaw.split("|").map(s => {
          const [jpSlot, enSlot] = s.split("=");
          return { jp: (jpSlot || "").trim(), en: (enSlot || "").trim() };
        }).filter(x => x.jp && x.en);
        if (!slots.length) slots = null;
      }

      return { no, jp, en, slots, video, lv, note, scene };
    });
}

function splitCSV(line) {
  const result = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === "," && !inQuotes) { result.push(cur); cur = ""; }
    else cur += c;
  }
  result.push(cur);

  return result.map(s => s.replace(/^"|"$/g, "").trim());
}

/*************************************************
 * Blocks
 *************************************************/
function getBlockIndex(no) {
  return Math.floor((no - 1) / 30) + 1;
}
function getMaxBlock() {
  if (!cards.length) return 1;
  return Math.ceil(Math.max(...cards.map(c => c.no)) / 30);
}
function getCardsByBlock(blockIndex) {
  return [...cards]
    .filter(c => getBlockIndex(c.no) === blockIndex)
    .sort((a, b) => a.no - b.no);
}

/*************************************************
 * Progress per Level
 * easy(grade=3) を付けたらクリア扱い
 *************************************************/
function isCleared(no, level) {
  const rec = srs[no]?.[level];
  return !!rec && rec.lastGrade === 3;
}
function blockLevelCount(blockIndex, level) {
  const list = getCardsByBlock(blockIndex);
  const total = list.length;
  const cleared = list.filter(c => isCleared(c.no, level)).length;
  return { cleared, total };
}

/*************************************************
 * Home: Block Table
 *************************************************/
function renderBlockTable() {
  const root = document.getElementById("blockTable");
  if (!root) return;

  const max = getMaxBlock();
  let html = "<table>";

  for (let b = 1; b <= max; b++) {
    const a = blockLevelCount(b, 1);
    const h = blockLevelCount(b, 2);
    const o = blockLevelCount(b, 3);

    const label = `${(b-1)*30+1}-${b*30}`;

    html += `
      <tr><td>
        <div class="row">
          <div class="blockLabel">${label}</div>
          <button class="lvBtn" data-block="${b}" data-level="1">
            <strong>Lv1</strong><span>${a.cleared}/${a.total}</span>
          </button>
          <button class="lvBtn" data-block="${b}" data-level="2">
            <strong>Lv2</strong><span>${h.cleared}/${h.total}</span>
          </button>
          <button class="lvBtn" data-block="${b}" data-level="3">
            <strong>Lv3</strong><span>${o.cleared}/${o.total}</span>
          </button>
        </div>
      </td></tr>
    `;
  }

  html += "</table>";
  root.innerHTML = html;

  root.querySelectorAll(".lvBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const b = Number(btn.dataset.block);
      const lv = Number(btn.dataset.level);
      startBlockLevel(b, lv);
    });
  });
}

/*************************************************
 * Scenes
 *************************************************/
function getScenes() {
  return [...new Set(cards.map(c => c.scene).filter(Boolean))];
}
function renderSceneButtons() {
  const wrap = document.getElementById("scenes");
  if (!wrap) return;
  wrap.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.textContent = "ALL";
  allBtn.onclick = () => startVideoOrder(true);
  wrap.appendChild(allBtn);

  getScenes().forEach(sc => {
    const btn = document.createElement("button");
    btn.textContent = sc;
    btn.onclick = () => startScene(sc);
    wrap.appendChild(btn);
  });
}
function startScene(scene) {
  cardsByMode = cards.filter(c => c.scene === scene).sort((a,b)=>a.no-b.no);
  baseSet = [...cardsByMode];
  loop = 1;
  index = 0;
  resetCardView();
  showStudy();
}

/*************************************************
 * Due / Weak (Home導線)
 *************************************************/
function isDue(no, level){
  const rec = srs[no]?.[level];
  return rec && rec.dueAt && rec.dueAt <= now();
}

function countDueAll(){
  const level = prefs.level;
  return cards.filter(c => isDue(c.no, level)).length;
}

function countDueBlock(){
  const level = prefs.level;
  const blockIndex = prefs.block || 1;
  return getCardsByBlock(blockIndex).filter(c => isDue(c.no, level)).length;
}

/*************************************************
 * Accuracy / Weak
 * 正答率 = easy / total
 *************************************************/
const WEAK_ACC_THRESHOLD = 0.70; // 70%
const WEAK_MIN_TOTAL = 3;

function getAcc(no, level){
  const rec = srs[no]?.[level];
  const total = rec?.total || 0;
  const easy  = rec?.easy  || 0;
  if (total === 0) return null;
  return easy / total;
}

function isWeak(no, level){
  const rec = srs[no]?.[level];
  if (!rec) return false;

  // 直近が again/hard は即苦手
  if (rec.lastGrade === 1 || rec.lastGrade === 2) return true;

  const total = rec.total || 0;
  if (total < WEAK_MIN_TOTAL) return false;

  const acc = getAcc(no, level);
  return acc !== null && acc < WEAK_ACC_THRESHOLD;
}

function countWeak(){
  const level = prefs.level;
  const blockIndex = prefs.block || 1;
  return getCardsByBlock(blockIndex).filter(c => isWeak(c.no, level)).length;
}

function renderHomeDue(){
  const all  = countDueAll();
  const blk  = countDueBlock();
  const weak = countWeak();

  if (dueAllText)   dueAllText.textContent   = `Due（全体）: ${all}`;
  if (dueBlockText) dueBlockText.textContent = `Due（今のブロック）: ${blk}`;
  if (weakText)     weakText.textContent     = `苦手（今ブロック）: ${weak}`;
}

/*************************************************
 * Start modes
 *************************************************/
function startBlockLevel(blockIndex, level) {
  prefs.block = blockIndex;
  prefs.level = level;
  saveAll();

  cardsByMode = getCardsByBlock(blockIndex);
  baseSet = [...cardsByMode];
  loop = 1;
  index = 0;
  resetCardView();
  showStudy();
}

function startVideoOrder(goStudy=false) {
  cardsByMode = [...cards].sort((a,b)=>a.no-b.no);
  baseSet = [...cardsByMode];
  loop = 1;
  index = 0;
  resetCardView();
  if (goStudy) showStudy(); else render();
}

function startDueAll(goStudy=true){
  const level = prefs.level;
  const due = cards.filter(c => isDue(c.no, level));
  if (!due.length){
    alert("Dueはありません");
    return;
  }
  cardsByMode = due.sort((a,b)=>a.no-b.no);
  baseSet = [...cardsByMode];
  loop = 1;
  index = 0;
  resetCardView();
  if (goStudy) showStudy(); else render();
}

function startDueBlock(goStudy=true){
  const level = prefs.level;
  const blockIndex = prefs.block || 1;
  const due = getCardsByBlock(blockIndex).filter(c => isDue(c.no, level));
  if (!due.length){
    alert("このブロックにDueはありません");
    return;
  }
  cardsByMode = due.sort((a,b)=>a.no-b.no);
  baseSet = [...cardsByMode];
  loop = 1;
  index = 0;
  resetCardView();
  if (goStudy) showStudy(); else render();
}

function startWeak(goStudy=true){
  const level = prefs.level;
  const blockIndex = prefs.block || 1;

  const base = getCardsByBlock(blockIndex);
  const weak = base.filter(c => isWeak(c.no, level));

  if (!weak.length){
    alert("苦手カードはありません（素晴らしい）");
    return;
  }

  cardsByMode = weak.sort((a,b)=>a.no-b.no);
  baseSet = [...cardsByMode];
  loop = 1;
  index = 0;
  resetCardView();
  if (goStudy) showStudy(); else render();
}

/*************************************************
 * Level buttons (Study)
 *************************************************/
function renderLevelButtons() {
  const lv = prefs.level;
  [lv1Btn, lv2Btn, lv3Btn].forEach((btn, i) => {
    const level = i + 1;
    const active = (lv === level);
    btn.style.background = active ? "#007aff" : "#202031";
    btn.style.color = active ? "#fff" : "#f3f3f5";
    btn.style.border = active ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.08)";
  });
}

/*************************************************
 * Progress bars
 *************************************************/
function renderProgress() {
  const textEl = document.getElementById("progressText");
  const barEl  = document.getElementById("progressBar");
  if (!textEl || !barEl) return;

  const b = prefs.block || 1;
  const lv = prefs.level || 1;
  const { cleared, total } = blockLevelCount(b, lv);

  textEl.textContent = `進捗：Lv${lv}  ${cleared} / ${total}`;
  barEl.style.width = total ? `${Math.round((cleared / total) * 100)}%` : "0%";
}

function renderDaily() {
  ensureDaily();
  const textEl = document.getElementById("dailyText");
  const barEl  = document.getElementById("dailyBar");
  if (!textEl || !barEl) return;

  const done = daily.goodCount || 0;
  const goal = daily.goal || 10;
  textEl.textContent = `今日: ${Math.min(done, goal)} / ${goal}`;
  barEl.style.width = goal ? `${Math.min(100, Math.round((done / goal) * 100))}%` : "0%";
}

/*************************************************
 * Card rendering
 *************************************************/
function pickSlot(card) {
  if (!card.slots || !card.slots.length) return null;

  // Lv1 = 固定（カード番号で固定化）
  if (prefs.level === 1) {
    const idx = (card.no % card.slots.length);
    return card.slots[idx];
  }
  // Lv2/Lv3 = 変動（ランダム）
  const idx = Math.floor(Math.random() * card.slots.length);
  return card.slots[idx];
}

function renderNote(card) {
  noteEl.textContent = (showNote && card.note) ? `💡 ${card.note}` : "";
}

function renderStats(card){
  if (!statsEl) return;

  const level = prefs.level;
  const rec = srs[card.no]?.[level];

  const total = rec?.total || 0;
  const easy  = rec?.easy  || 0;

  if (total === 0) {
    statsEl.textContent = "正答率: --%（まだ未回答）";
    return;
  }

  const acc = Math.round((easy / total) * 100);
  statsEl.textContent = `正答率: ${acc}%（easy ${easy} / 回答 ${total}）`;
}

function renderLoop(){
  if (!loopEl) return;
  loopEl.textContent = `周回: ${loop === 1 ? "1周目" : "2周目（復習）"}`;
}

function render() {
  if (!cardsByMode.length) return;

  const card = cardsByMode[index];
  const slot = pickSlot(card);

  // answer決定（{x}両対応）
  if (slot && card.jp.includes("{x}") && card.en.includes("{x}")) {
    jpEl.textContent = card.jp.replace("{x}", slot.jp);
    currentAnswer = card.en.replace("{x}", slot.en);
  } else {
    jpEl.textContent = card.jp;
    currentAnswer = card.en;
  }

  // EN表示（Lv挙動）
  if (prefs.level === 3) {
    // Lv3：英語ヒント無し（タップで答え）
    enEl.textContent = revealed ? currentAnswer : "（タップで答え）";
  } else {
    // Lv1/Lv2：未表示時は穴埋め/タップ
    if (!revealed) {
      if (card.en.includes("{x}")) enEl.textContent = card.en.replace("{x}", "___");
      else enEl.textContent = "タップして答え";
    } else {
      enEl.textContent = currentAnswer;
    }
  }

  renderNote(card);
  renderStats(card);
  renderProgress();
  renderDaily();
  renderLevelButtons();
  renderHomeDue();
  renderLoop();
}

/*************************************************
 * 周回終了 → Dueだけ2周目
 *************************************************/
function buildDueFromBase(){
  const level = prefs.level;
  return baseSet.filter(c => {
    const rec = srs[c.no]?.[level];
    // easy(3) 以外が残り
    return !rec || rec.lastGrade !== 3;
  });
}

function finishLoop(){
  if (loop === 1){
    const due = buildDueFromBase();
    if (due.length){
      loop = 2;
      cardsByMode = due.sort((a,b)=>a.no-b.no);
      index = 0;
      resetCardView();
      alert(`1周目完了。残り ${due.length} 問を復習します`);
      render();
      return;
    }
    alert("🎉 1周目で全クリア！");
    showHome();
  } else {
    alert("🎉 復習も完了！");
    showHome();
  }
}

/*************************************************
 * Grade (level-separated + accuracy counters)
 *************************************************/
function gradeCard(grade) {
  if (!cardsByMode.length) return;

  const level = prefs.level;
  const card = cardsByMode[index];

  if (!srs[card.no]) srs[card.no] = {};
  if (!srs[card.no][level]) srs[card.no][level] = {};

  const rec = srs[card.no][level];

  // 回答数カウント
  rec.total = (rec.total || 0) + 1;
  if (grade === 3) rec.easy = (rec.easy || 0) + 1;

  rec.lastGrade = grade;
  rec.intervalMs = nextIntervalMs(grade);

  // dueAt：again/hardのみ有効。easyは無限先でDue除外
  if (grade === 1 || grade === 2) {
    rec.dueAt = now() + rec.intervalMs;
  } else {
    rec.dueAt = Infinity;
  }

  saveAll();

  // dailyは easy のみ進める（達成感）
  if (grade === 3) {
    ensureDaily();
    daily.goodCount = (daily.goodCount || 0) + 1;
    saveAll();
  }

  goNext();
}

function goNext() {
  index++;
  if (index >= cardsByMode.length) {
    finishLoop();
    return;
  }
  resetCardView();
  render();
}

/*************************************************
 * Events
 *************************************************/
homeVideoBtn.addEventListener("click", () => startVideoOrder(true));
homeWeakBtn.addEventListener("click", () => startWeak(true));
homeDueAllBtn.addEventListener("click", () => startDueAll(true));
homeDueBlockBtn.addEventListener("click", () => startDueBlock(true));

backHomeBtn.addEventListener("click", showHome);
videoBtn.addEventListener("click", () => startVideoOrder(false));
reviewBtn.addEventListener("click", () => startDueAll(false));
nextBtn.addEventListener("click", goNext);

g1.addEventListener("click", () => gradeCard(1));
g2.addEventListener("click", () => gradeCard(2));
g3.addEventListener("click", () => gradeCard(3));

lv1Btn.addEventListener("click", () => { prefs.level = 1; saveAll(); resetCardView(); render(); });
lv2Btn.addEventListener("click", () => { prefs.level = 2; saveAll(); resetCardView(); render(); });
lv3Btn.addEventListener("click", () => { prefs.level = 3; saveAll(); resetCardView(); render(); });

cardEl.addEventListener("click", () => {
  revealed = !revealed;
  showNote = revealed;
  render();
});

/*************************************************
 * Init
 *************************************************/
loadAllCSVs();
