/*************************************************
 * Keys (v2 3-step)
 *************************************************/
const SRS_KEY  = "srs_levels_v2_3step";
const DAILY_KEY = "daily_levels_v2_3step";
const PREF_KEY = "prefs_levels_v2_3step";

/*************************************************
 * Time
 *************************************************/
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const now = () => Date.now();

/*************************************************
 * 3段階SRS（あなたの設定）
 * 1 AGAIN : 5m
 * 2 HARD  : 6h
 * 3 EASY  : 12d
 *************************************************/
function nextIntervalMs(grade) {
  switch (grade) {
    case 1: return 5 * MIN;
    case 2: return 6 * HOUR;
    case 3: return 12 * DAY;
    default: return 12 * DAY;
  }
}

/*************************************************
 * Load/Save
 *************************************************/
let srs = JSON.parse(localStorage.getItem(SRS_KEY) || "{}");
// srs[no] = { 1:{dueAt,intervalMs,lastGrade}, 2:{...}, 3:{...} }

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

// Session control: 1周目→Due周回（Easyになるまで）
let sessionMode = "normal";      // "normal" | "due"
let sessionDueSet = new Set();   // again/hard になったカード番号

/*************************************************
 * Videos meta (optional)
 * data/videos.csv: video,title,url
 *************************************************/
let videos = {}; // videos["1"] = {title,url}

/*************************************************
 * DOM
 *************************************************/
const homeView = document.getElementById("homeView");
const studyView = document.getElementById("studyView");
const statsView = document.getElementById("statsView");

const homeDueBtn = document.getElementById("homeDue");
const homeVideoBtn = document.getElementById("homeVideo");
const homeStatsBtn = document.getElementById("homeStats");

const backHomeBtn = document.getElementById("backHome");
const videoBtn = document.getElementById("videoOrder");
const nextBtn = document.getElementById("next");
const reviewBtn = document.getElementById("review");

const jpEl = document.getElementById("jp");
const enEl = document.getElementById("en");
const cardEl = document.getElementById("card");
const noteEl = document.getElementById("noteText");

const g1 = document.getElementById("g1");
const g2 = document.getElementById("g2");
const g3 = document.getElementById("g3");

const lv1Btn = document.getElementById("lv1Btn");
const lv2Btn = document.getElementById("lv2Btn");
const lv3Btn = document.getElementById("lv3Btn");

/*************************************************
 * Views
 *************************************************/
function showHome() {
  homeView.classList.remove("hidden");
  studyView.classList.add("hidden");
  statsView.classList.add("hidden");
  renderDaily();
  renderProgress();
  renderBlockTable();
  renderSceneButtons();
}

function showStudy() {
  homeView.classList.add("hidden");
  studyView.classList.remove("hidden");
  statsView.classList.add("hidden");
  renderLevelButtons();
  render();
}

function showStats() {
  homeView.classList.add("hidden");
  studyView.classList.add("hidden");
  statsView.classList.remove("hidden");
  renderStats();
}

function resetCardView() {
  revealed = false;
  showNote = false;
}

/*************************************************
 * CSV helpers
 *************************************************/
function splitCSV(line) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let c of line) {
    if (c === '"') inQuotes = !inQuotes;
    else if (c === "," && !inQuotes) { result.push(cur); cur = ""; }
    else cur += c;
  }
  result.push(cur);
  return result.map(s => s.replace(/^"|"$/g, ""));
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (!lines.length) return [];
  lines.shift(); // header

  return lines
    .filter(line => line.trim().length > 0)
    .map(line => {
      const cols = splitCSV(line);

      const no = Number(cols[0]);
      const jp = (cols[1] || "").trim();
      const en = (cols[2] || "").trim();
      const slotsRaw = (cols[3] || "").trim();
      const video = (cols[4] || "").trim();
      const lv = Number((cols[5] || "1").trim());
      const note = (cols[6] || "").trim();
      const scene = (cols[7] || "").trim();

      let slots = null;
      if (slotsRaw) {
        slots = slotsRaw.split("|").map(s => {
          const [jpSlot, enSlot] = s.split("=");
          return { jp: (jpSlot || "").trim(), en: (enSlot || "").trim() };
        }).filter(x => x.jp && x.en);
        if (!slots.length) slots = null;
      }

      return { no, jp, en, slots, video, lv, note, scene };
    })
    .filter(c => Number.isFinite(c.no) && c.jp);
}

/*************************************************
 * File naming / fetch
 *************************************************/
function pad2(n){ return String(n).padStart(2, "0"); }
function pad3(n){ return String(n).padStart(3, "0"); }

async function fetchTextSafe(file) {
  try {
    const res = await fetch(file, { cache: "no-store" });
    if (!res.ok) return null;
    const text = await res.text();
    const t = text.trim();
    if (t.startsWith("<!DOCTYPE") || t.includes("<html")) return null;
    return text;
  } catch (e) {
    return null;
  }
}

/*************************************************
 * Videos meta loader (optional)
 *************************************************/
async function loadVideosMeta() {
  videos = {};
  const text = await fetchTextSafe("./data/videos.csv");
  if (!text) return;

  const lines = text.trim().split("\n");
  if (lines.length <= 1) return;

  lines.shift(); // header
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = splitCSV(line);
    const id = String((cols[0] || "").trim());
    if (!id) continue;
    videos[id] = {
      title: (cols[1] || "").trim(),
      url: (cols[2] || "").trim()
    };
  }
}

function getVideoLabel(videoId) {
  const id = String(videoId || "");
  const meta = videos[id];
  if (!id) return "Other（元動画なし）";
  if (!meta) return `Video ${id}`;
  const t = meta.title ? meta.title : `Video ${id}`;
  return `Video ${id} — ${t}`;
}

function getVideoUrl(videoId) {
  const id = String(videoId || "");
  return videos[id]?.url || "";
}

/*************************************************
 * CSV Auto Loader (manifest不要, iPhone向け軽量探索)
 *************************************************/
async function loadAllCSVs() {
  cards = [];
  await loadVideosMeta();

  const MAX_VIDEO = 50;
  const MAX_BLOCK = 50;
  const MISS_LIMIT_VIDEO = 3; // 連続で動画が無い → 終了
  const MISS_LIMIT_BLOCK = 2; // 連続でブロックが無い → 次の動画へ

  if (jpEl) jpEl.textContent = "CSV読み込み中…";
  if (enEl) enEl.textContent = "";

  let missVideo = 0;

  for (let v = 1; v <= MAX_VIDEO; v++) {
    let missBlock = 0;
    let loadedAnyInThisVideo = false;

    for (let b = 0; b < MAX_BLOCK; b++) {
      const start = b * 30 + 1;
      const end = start + 29;

      const file = `./data/video${pad2(v)}_${pad3(start)}-${pad3(end)}.csv`;
      const text = await fetchTextSafe(file);

      if (!text) {
        missBlock++;
        if (missBlock >= MISS_LIMIT_BLOCK) break;
        continue;
      }

      missBlock = 0;
      loadedAnyInThisVideo = true;

      const parsed = parseCSV(text);
      if (parsed.length) cards.push(...parsed);
    }

    if (!loadedAnyInThisVideo) {
      missVideo++;
      if (missVideo >= MISS_LIMIT_VIDEO) break;
    } else {
      missVideo = 0;
    }
  }

  if (!cards.length) {
    alert("csvが1件も読み込めませんでした（ファイル名/場所/ヘッダを確認）");
    return;
  }

  cards.sort((a, b) => a.no - b.no);

  // 初期モード（ブロック）
  cardsByMode = getCardsByBlock(prefs.block || 1);
  index = 0;
  resetCardView();

  showHome();
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
 * Clear rule: EASY only
 *************************************************/
function isCleared(no, level) {
  const rec = srs[no]?.[level];
  return !!rec && (rec.lastGrade === 3);
}
function blockLevelCount(blockIndex, level) {
  const list = getCardsByBlock(blockIndex);
  const total = list.length;
  const cleared = list.filter(c => isCleared(c.no, level)).length;
  return { cleared, total };
}

/*************************************************
 * Block video id (for grouping)
 *************************************************/
function getBlockVideoId(blockIndex) {
  const list = getCardsByBlock(blockIndex);
  if (!list.length) return "";
  return String(list[0].video || "");
}

/*************************************************
 * Home Block Table (grouped by video) + ✔︎ when fully cleared
 *************************************************/
function renderBlockTable() {
  const root = document.getElementById("blockTable");
  if (!root) return;

  const max = getMaxBlock();

  const groups = {}; // key = videoId or "other"
  for (let b = 1; b <= max; b++) {
    const vid = getBlockVideoId(b);
    const key = vid ? vid : "other";
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  }

  const keys = Object.keys(groups).sort((a, b) => {
    if (a === "other") return 1;
    if (b === "other") return -1;
    return Number(a) - Number(b);
  });

  let html = "";

  keys.forEach(key => {
    const isOther = (key === "other");
    const label = isOther ? "Other（元動画なし）" : getVideoLabel(key);
    const url = isOther ? "" : getVideoUrl(key);

    html += `<div class="videoSection">`;
    html += `<div class="videoHeader">`;
    if (url) {
      html += `<a class="videoLink" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    } else {
      html += `<div class="videoTitle">${label}</div>`;
    }
    html += `</div>`;

    html += `<table class="blockTbl">`;

    groups[key].forEach(b => {
      const a = blockLevelCount(b, 1);
      const h = blockLevelCount(b, 2);
      const o = blockLevelCount(b, 3);

      const aDone = (a.total > 0 && a.cleared === a.total);
      const hDone = (h.total > 0 && h.cleared === h.total);
      const oDone = (o.total > 0 && o.cleared === o.total);

      const range = `${(b-1)*30+1}-${b*30}`;

      const aText = aDone ? `<span class="done">✔︎</span>` : `<span>${a.cleared}/${a.total}</span>`;
      const hText = hDone ? `<span class="done">✔︎</span>` : `<span>${h.cleared}/${h.total}</span>`;
      const oText = oDone ? `<span class="done">✔︎</span>` : `<span>${o.cleared}/${o.total}</span>`;

      html += `
        <tr><td>
          <div class="row">
            <div class="blockLabel">${range}</div>
            <button class="lvBtn" data-block="${b}" data-level="1">
              <strong>Lv1</strong>${aText}
            </button>
            <button class="lvBtn" data-block="${b}" data-level="2">
              <strong>Lv2</strong>${hText}
            </button>
            <button class="lvBtn" data-block="${b}" data-level="3">
              <strong>Lv3</strong>${oText}
            </button>
          </div>
        </td></tr>
      `;
    });

    html += `</table></div>`;
  });

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
 * Scenes filter
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
  sessionMode = "normal";
  sessionDueSet = new Set();

  cardsByMode = cards.filter(c => c.scene === scene).sort((a,b)=>a.no-b.no);
  index = 0; resetCardView();
  showStudy();
}

/*************************************************
 * Start modes
 *************************************************/
function startBlockLevel(blockIndex, level) {
  prefs.block = blockIndex;
  prefs.level = level;
  saveAll();

  sessionMode = "normal";
  sessionDueSet = new Set();

  cardsByMode = getCardsByBlock(blockIndex);
  index = 0;
  resetCardView();
  showStudy();
}

function startVideoOrder(goStudy=false) {
  sessionMode = "normal";
  sessionDueSet = new Set();

  cardsByMode = [...cards].sort((a,b)=>a.no-b.no);
  index = 0; resetCardView();
  if (goStudy) showStudy(); else render();
}

function startReviewDue(goStudy=false) {
  sessionMode = "normal";
  sessionDueSet = new Set();

  const level = prefs.level;
  const due = cards.filter(c => {
    const d = srs[c.no]?.[level]?.dueAt ?? Infinity;
    return d <= now();
  });

  if (!due.length) { alert("復習（Due）はありません"); return; }

  cardsByMode = due.sort((a,b)=>a.no-b.no);
  index = 0; resetCardView();
  if (goStudy) showStudy(); else render();
}

/*************************************************
 * Level buttons
 *************************************************/
function renderLevelButtons() {
  const lv = prefs.level;
  if (!lv1Btn || !lv2Btn || !lv3Btn) return;

  lv1Btn.style.background = (lv===1) ? "#007aff" : "#eee";
  lv1Btn.style.color = (lv===1) ? "#fff" : "#111";
  lv2Btn.style.background = (lv===2) ? "#007aff" : "#eee";
  lv2Btn.style.color = (lv===2) ? "#fff" : "#111";
  lv3Btn.style.background = (lv===3) ? "#007aff" : "#eee";
  lv3Btn.style.color = (lv===3) ? "#fff" : "#111";
}

/*************************************************
 * Progress bars (Home + Study) + mode tag
 *************************************************/
function renderProgress() {
  const b = prefs.block || 1;
  const lv = prefs.level || 1;
  const { cleared, total } = blockLevelCount(b, lv);

  const text = `進捗：Lv${lv}  ${cleared} / ${total}`;
  const width = total ? `${Math.round((cleared / total) * 100)}%` : "0%";

  // Home
  const homeTextEl = document.getElementById("progressText");
  const homeBarEl  = document.getElementById("progressBar");
  if (homeTextEl) homeTextEl.textContent = text;
  if (homeBarEl) homeBarEl.style.width = width;

  // Study
  const studyTextEl = document.getElementById("studyProgressText");
  const studyBarEl  = document.getElementById("studyProgressBar");
  if (studyTextEl) studyTextEl.textContent = text;
  if (studyBarEl) studyBarEl.style.width = width;

  // Mode tag (+ due remaining)
  const tag = document.getElementById("studyModeTag");
  if (tag) {
    if (sessionMode === "due") {
      const remaining = sessionDueSet ? sessionDueSet.size : 0;
      tag.textContent = `Due（残り${remaining}）`;
      tag.classList.add("due");
    } else {
      tag.textContent = "通常";
      tag.classList.remove("due");
    }
  }
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
 * Card rendering (Lv behavior)
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
  if (!noteEl) return;
  noteEl.textContent = (showNote && card.note) ? `💡 ${card.note}` : "";
}

function render() {
  if (!cardsByMode.length) return;

  const card = cardsByMode[index];
  const slot = pickSlot(card);

  // answer決定（JP/ENのセットで置換）
  if (slot && card.jp.includes("{x}") && card.en.includes("{x}")) {
    jpEl.textContent = card.jp.replace("{x}", slot.jp);
    currentAnswer = card.en.replace("{x}", slot.en);
  } else {
    jpEl.textContent = card.jp;
    currentAnswer = card.en;
  }

  // 表示
  if (prefs.level === 3) {
    enEl.textContent = revealed ? currentAnswer : "（タップで答え）";
  } else {
    if (!revealed) {
      if (card.en.includes("{x}")) enEl.textContent = card.en.replace("{x}", "___");
      else enEl.textContent = "タップして答え";
    } else {
      enEl.textContent = currentAnswer;
    }
  }

  renderNote(card);
  renderProgress();
  renderDaily();
  renderLevelButtons();
}

/*************************************************
 * Due deck rebuild (Easyになるまで終わらない)
 *************************************************/
function rebuildDueDeck() {
  const dueNos = Array.from(sessionDueSet);
  cardsByMode = cards
    .filter(c => dueNos.includes(c.no))
    .sort((a,b)=>a.no-b.no);

  index = 0;
  resetCardView();
}

/*************************************************
 * Round control
 *************************************************/
function handleEndOfRound() {
  if (sessionMode === "normal") {
    if (sessionDueSet.size > 0) {
      sessionMode = "due";
      rebuildDueDeck();
      alert("1周目おわり！\n次は Due（Again/Hard）だけ。Easyになるまで終わらないよ。");
      render();
      return;
    } else {
      alert("クリア！\nDueはありません。");
      showHome();
      return;
    }
  }

  // Due周回が終わった
  if (sessionMode === "due") {
    if (sessionDueSet.size > 0) {
      rebuildDueDeck();
      alert(`Due残り ${cardsByMode.length}問。もう一周いくよ。`);
      render();
      return;
    } else {
      alert("Dueも完了！おつかれ！");
      showHome();
      return;
    }
  }
}

function goNext() {
  index += 1;
  resetCardView();

  if (index >= cardsByMode.length) {
    handleEndOfRound();
    return;
  }
  render();
}

/*************************************************
 * Grade (3-step)
 * - normal: again/hard => Due追加, easy => クリア扱い(進捗UP)
 * - due: easy => Dueから外す, again/hard => 残る
 *************************************************/
function gradeCard(grade) {
  if (!cardsByMode.length) return;

  const level = prefs.level;
  const card = cardsByMode[index];

  if (!srs[card.no]) srs[card.no] = {};
  if (!srs[card.no][level]) srs[card.no][level] = {};

  const rec = srs[card.no][level];

  // ✅ カウント追加
  rec.total = (rec.total || 0) + 1;
  if (grade === 3) {          // ← easy が 3 の場合（あなたの現状に合わせて）
    rec.easy = (rec.easy || 0) + 1;
  }

  // 既存のSRS処理（dueAtなど）
  rec.lastGrade = grade;
  rec.intervalMs = nextIntervalMs(grade);
  rec.dueAt = now() + rec.intervalMs;

  saveAll();

  // 既存の進捗加算（easyだけ進む、など）
  if (grade === 3) {
    ensureDaily();
    daily.goodCount = (daily.goodCount || 0) + 1;
    saveAll();
  }

  goNext();
}

/*************************************************
 * Events
 *************************************************/
if (homeDueBtn) homeDueBtn.addEventListener("click", () => startReviewDue(true));
if (homeVideoBtn) homeVideoBtn.addEventListener("click", () => startVideoOrder(true));
if (homeStatsBtn) homeStatsBtn.addEventListener("click", showStats);

if (backHomeBtn) backHomeBtn.addEventListener("click", showHome);

const backFromStatsBtn = document.getElementById("backFromStats");
if (backFromStatsBtn) backFromStatsBtn.addEventListener("click", showHome);
if (videoBtn) videoBtn.addEventListener("click", () => startVideoOrder(false));
if (reviewBtn) reviewBtn.addEventListener("click", () => startReviewDue(false));
if (nextBtn) nextBtn.addEventListener("click", goNext);

if (g1) g1.addEventListener("click", () => gradeCard(1));
if (g2) g2.addEventListener("click", () => gradeCard(2));
if (g3) g3.addEventListener("click", () => gradeCard(3));

if (lv1Btn) lv1Btn.addEventListener("click", () => { prefs.level = 1; saveAll(); resetCardView(); render(); });
if (lv2Btn) lv2Btn.addEventListener("click", () => { prefs.level = 2; saveAll(); resetCardView(); render(); });
if (lv3Btn) lv3Btn.addEventListener("click", () => { prefs.level = 3; saveAll(); resetCardView(); render(); });

if (cardEl) cardEl.addEventListener("click", () => {
  revealed = !revealed;
  showNote = revealed;
  render();
});

/*************************************************
 * Stats View
 *************************************************/
function calculateStats() {
  const totalCards = cards.length;
  let studied = 0;
  let dueCount = 0;
  let mastered = 0;

  const levelStats = { 1: {}, 2: {}, 3: {} };
  const gradeCount = { 1: 0, 2: 0, 3: 0 };
  const sceneCount = {};

  cards.forEach(card => {
    const scene = card.scene || "その他";
    sceneCount[scene] = (sceneCount[scene] || 0) + 1;

    for (let lv = 1; lv <= 3; lv++) {
      const rec = srs[card.no]?.[lv];

      if (!levelStats[lv][scene]) {
        levelStats[lv][scene] = { studied: 0, mastered: 0 };
      }

      if (rec && rec.total > 0) {
        levelStats[lv][scene].studied++;

        if (lv === prefs.level) {
          studied++;
        }

        if (rec.lastGrade) {
          gradeCount[rec.lastGrade]++;
        }

        // 習得済み判定：easy率が80%以上
        if (rec.easy && rec.total >= 3 && (rec.easy / rec.total) >= 0.8) {
          levelStats[lv][scene].mastered++;
          if (lv === prefs.level) {
            mastered++;
          }
        }

        // Due判定
        if (rec.dueAt && rec.dueAt <= now() && lv === prefs.level) {
          dueCount++;
        }
      }
    }
  });

  return {
    totalCards,
    studied,
    dueCount,
    mastered,
    levelStats,
    gradeCount,
    sceneCount
  };
}

function renderStats() {
  const stats = calculateStats();

  // 全体サマリー
  document.getElementById("totalCards").textContent = stats.totalCards;
  document.getElementById("studiedCards").textContent = stats.studied;
  document.getElementById("dueCards").textContent = stats.dueCount;
  document.getElementById("masteredCards").textContent = stats.mastered;

  // レベル別進捗
  const levelStatsEl = document.getElementById("levelStats");
  let levelHtml = "";
  for (let lv = 1; lv <= 3; lv++) {
    const total = stats.totalCards;
    const studied = Object.values(stats.levelStats[lv]).reduce((sum, s) => sum + s.studied, 0);
    const mastered = Object.values(stats.levelStats[lv]).reduce((sum, s) => sum + s.mastered, 0);
    const pct = total > 0 ? Math.round((studied / total) * 100) : 0;

    levelHtml += `
      <div class="levelStatRow">
        <div class="levelStatLabel">Lv${lv}</div>
        <div class="levelStatBar">
          <div class="levelStatProgress" style="width: ${pct}%"></div>
        </div>
        <div class="levelStatText">${studied} / ${total} (習得: ${mastered})</div>
      </div>
    `;
  }
  levelStatsEl.innerHTML = levelHtml;

  // 評価の分布
  const gradeDistEl = document.getElementById("gradeDistribution");
  const gradeTotal = stats.gradeCount[1] + stats.gradeCount[2] + stats.gradeCount[3];
  let gradeHtml = "";

  if (gradeTotal > 0) {
    const grades = [
      { grade: 1, label: "Again", color: "#ef4444" },
      { grade: 2, label: "Hard", color: "#f59e0b" },
      { grade: 3, label: "Easy", color: "#10b981" }
    ];

    grades.forEach(({ grade, label, color }) => {
      const count = stats.gradeCount[grade];
      const pct = Math.round((count / gradeTotal) * 100);
      gradeHtml += `
        <div class="gradeStatRow">
          <div class="gradeStatLabel">${label}</div>
          <div class="gradeStatBar">
            <div class="gradeStatProgress" style="width: ${pct}%; background: ${color}"></div>
          </div>
          <div class="gradeStatText">${count} (${pct}%)</div>
        </div>
      `;
    });
  } else {
    gradeHtml = '<div class="noData">まだ学習データがありません</div>';
  }
  gradeDistEl.innerHTML = gradeHtml;

  // シーン別カード数
  const sceneStatsEl = document.getElementById("sceneStats");
  let sceneHtml = "";
  const scenes = Object.keys(stats.sceneCount).sort();

  scenes.forEach(scene => {
    const count = stats.sceneCount[scene];
    sceneHtml += `
      <div class="sceneStatRow">
        <div class="sceneStatLabel">${scene}</div>
        <div class="sceneStatValue">${count}</div>
      </div>
    `;
  });
  sceneStatsEl.innerHTML = sceneHtml || '<div class="noData">データがありません</div>';

  // 最近7日間の学習
  const recentEl = document.getElementById("recentActivity");
  recentEl.innerHTML = '<div class="noData">履歴機能は今後実装予定</div>';
}

/*************************************************
 * Init
 *************************************************/
loadAllCSVs();
