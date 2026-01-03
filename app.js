/*************************************************
 * Keys (v2 3-step)
 *************************************************/
const SRS_KEY  = "srs_levels_v2_3step";
const DAILY_KEY = "daily_levels_v2_3step";
const PREF_KEY = "prefs_levels_v2_3step";
const VISITED_KEY = "has_visited_v2";
const MISSION_KEY = "daily_mission_v1";
const STREAK_KEY = "learning_streak_v1";

/*************************************************
 * Time
 *************************************************/
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const now = () => Date.now();

/*************************************************
 * Sample Data (for first-time users)
 *************************************************/
const SAMPLE_CARDS = [
  { no: 1, jp: "おはようございます。", en: "Good morning.", video: "sample", lv: 1, note: "朝の挨拶。", scene: "daily", hint_1: "morning を使う", hint_2: "Good を使う", explain_meaning: "朝の基本的な挨拶", explain_nuance: "フォーマルでもカジュアルでも使える万能挨拶", explain_grammar: "Good + 時間帯で挨拶", similars: "Hi|Hello|Morning" },
  { no: 2, jp: "ありがとうございます。", en: "Thank you.", video: "sample", lv: 1, note: "感謝の基本。", scene: "daily", hint_1: "thank を使う", hint_2: "Thank you", explain_meaning: "感謝を伝える最も基本的な表現", explain_nuance: "どんな場面でも使える", explain_grammar: "Thank you は定型表現", similars: "Thanks|I appreciate it|Cheers" },
  { no: 3, jp: "すみません。", en: "Excuse me.", video: "sample", lv: 1, note: "声をかける時。", scene: "daily", hint_1: "excuse を使う", hint_2: "me を使う", explain_meaning: "人に話しかける時の前置き", explain_nuance: "丁寧に注意を引く表現", explain_grammar: "Excuse me は慣用表現", similars: "Sorry|Pardon me|Sorry to bother you" },
  { no: 4, jp: "わかりました。", en: "I understand.", video: "sample", lv: 1, note: "理解を示す。", scene: "daily", hint_1: "understand を使う", hint_2: "I で始まる", explain_meaning: "理解したことを伝える", explain_nuance: "相手の話を受け止めたことを示す", explain_grammar: "I understand は現在形", similars: "I got it|I see|Got it" },
  { no: 5, jp: "少々お待ちください。", en: "Just a moment, please.", video: "sample", lv: 1, note: "待ってもらう時。", scene: "work", hint_1: "moment を使う", hint_2: "Just を使う", explain_meaning: "少し待ってほしいと丁寧に依頼する", explain_nuance: "ビジネスでも日常でも使える", explain_grammar: "Just a moment で「ちょっと待って」", similars: "One moment|Please wait|Hold on" },
  { no: 6, jp: "手伝いましょうか？", en: "Can I help you?", video: "sample", lv: 1, note: "手助けの申し出。", scene: "daily", hint_1: "help を使う", hint_2: "Can I を使う", explain_meaning: "手伝いを申し出る基本表現", explain_nuance: "親切な印象を与える", explain_grammar: "Can I + 動詞で申し出", similars: "Need any help?|May I help you?|Do you need help?" },
  { no: 7, jp: "いいですね。", en: "Sounds good.", video: "sample", lv: 1, note: "同意・賛成。", scene: "daily", hint_1: "sound を使う", hint_2: "good を使う", explain_meaning: "提案に同意する", explain_nuance: "カジュアルで前向きな返答", explain_grammar: "Sounds + 形容詞で印象", similars: "That works|Sounds great|I'm in" },
  { no: 8, jp: "どういう意味ですか？", en: "What does that mean?", video: "sample", lv: 1, note: "意味を聞く。", scene: "daily", hint_1: "mean を使う", hint_2: "What を使う", explain_meaning: "意味を尋ねる", explain_nuance: "理解できない時の素直な質問", explain_grammar: "What does ~ mean? で意味を聞く", similars: "What do you mean?|I don't get it|Can you explain?" },
  { no: 9, jp: "後で連絡します。", en: "I'll contact you later.", video: "sample", lv: 1, note: "後で連絡。", scene: "work", hint_1: "contact を使う", hint_2: "later を使う", explain_meaning: "後で連絡することを約束する", explain_nuance: "ビジネスでよく使う", explain_grammar: "I'll + 動詞 + later で後の約束", similars: "I'll get back to you|Talk to you later|I'll reach out later" },
  { no: 10, jp: "確認させてください。", en: "Let me check.", video: "sample", lv: 1, note: "確認する時。", scene: "work", hint_1: "check を使う", hint_2: "Let me を使う", explain_meaning: "確認させてほしいと伝える", explain_nuance: "丁寧で責任感のある対応", explain_grammar: "Let me + 動詞で許可を求める", similars: "I'll check|Let me verify|I'll look into it" },
  { no: 11, jp: "大丈夫です。", en: "I'm fine.", video: "sample", lv: 1, note: "問題ない時。", scene: "daily", hint_1: "fine を使う", hint_2: "I'm を使う", explain_meaning: "問題ないことを伝える", explain_nuance: "心配に対する安心の返答", explain_grammar: "I'm fine は状態を示す", similars: "I'm okay|I'm good|No worries" },
  { no: 12, jp: "いい考えですね。", en: "That's a good idea.", video: "sample", lv: 1, note: "提案を評価。", scene: "work", hint_1: "idea を使う", hint_2: "good を使う", explain_meaning: "提案を肯定的に評価する", explain_nuance: "相手のアイデアを認める", explain_grammar: "That's a + 形容詞 + 名詞", similars: "Good thinking|Great idea|Smart idea" },
  { no: 13, jp: "もう一度お願いします。", en: "Could you say that again?", video: "sample", lv: 1, note: "聞き返す時。", scene: "daily", hint_1: "again を使う", hint_2: "Could you を使う", explain_meaning: "もう一度言ってほしいと依頼する", explain_nuance: "丁寧な聞き返し", explain_grammar: "Could you + 動詞で丁寧な依頼", similars: "Pardon?|Come again?|Could you repeat that?" },
  { no: 14, jp: "頑張ってください。", en: "Good luck.", video: "sample", lv: 1, note: "応援する時。", scene: "daily", hint_1: "luck を使う", hint_2: "Good を使う", explain_meaning: "成功を祈る応援の言葉", explain_nuance: "別れ際や挑戦前に使う", explain_grammar: "Good luck は定型表現", similars: "Best of luck|You got this|Go for it" },
  { no: 15, jp: "お疲れ様でした。", en: "Good job.", video: "sample", lv: 1, note: "労いの言葉。", scene: "work", hint_1: "job を使う", hint_2: "Good を使う", explain_meaning: "仕事を終えた人を労う", explain_nuance: "努力を認める表現", explain_grammar: "Good job は褒め言葉", similars: "Well done|Nice work|Great effort" }
];

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
  goal: 10,
  stats: {
    uniqueCards: [],
    grades: {
      again: 0,
      hard: 0,
      easy: 0
    }
  }
};

// 既存データのマイグレーション（statsがない場合）
if (!daily.stats) {
  daily.stats = {
    uniqueCards: [],
    grades: { again: 0, hard: 0, easy: 0 }
  };
}

let prefs = JSON.parse(localStorage.getItem(PREF_KEY) || "null") || {
  level: 1,
  block: 1
};

let dailyMission = JSON.parse(localStorage.getItem(MISSION_KEY) || "null") || {
  date: new Date().toDateString(),
  completed: {
    due: false,
    weak: false,
    newBlock: false
  },
  progress: {
    weak: 0,
    newBlock: 0
  }
};

let streak = JSON.parse(localStorage.getItem(STREAK_KEY) || "null") || {
  current: 0,
  longest: 0,
  lastCompletedDate: null
};

function saveAll() {
  localStorage.setItem(SRS_KEY, JSON.stringify(srs));
  localStorage.setItem(DAILY_KEY, JSON.stringify(daily));
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  localStorage.setItem(MISSION_KEY, JSON.stringify(dailyMission));
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
}

function ensureDaily() {
  const today = new Date().toDateString();
  if (daily.day !== today) {
    // 前日の連続日数チェック
    checkStreakOnDayChange(today);

    daily.day = today;
    daily.goodCount = 0;
    daily.stats = {
      uniqueCards: [],
      grades: { again: 0, hard: 0, easy: 0 }
    };
    saveAll();
  }

  // デイリーミッションも日付チェック
  if (dailyMission.date !== today) {
    dailyMission = {
      date: today,
      completed: { due: false, weak: false, newBlock: false },
      progress: { weak: 0, newBlock: 0 }
    };
    saveAll();
  }
}

/*************************************************
 * Streak Management
 *************************************************/
function checkStreakOnDayChange(today) {
  // 前日に全ミッション完了していなかった場合、連続記録をリセット
  const yesterday = new Date(Date.parse(today) - DAY).toDateString();

  if (streak.lastCompletedDate !== yesterday) {
    // 連続記録が途切れた
    streak.current = 0;
    saveAll();
  }
}

function updateStreakOnComplete() {
  const today = new Date().toDateString();

  // 今日すでに完了済みの場合は何もしない
  if (streak.lastCompletedDate === today) {
    return;
  }

  const yesterday = new Date(Date.now() - DAY).toDateString();

  if (streak.lastCompletedDate === yesterday) {
    // 前日も完了していた → 連続記録を伸ばす
    streak.current++;
  } else {
    // 初回 or 途切れていた → 1日目
    streak.current = 1;
  }

  // 最長記録を更新
  if (streak.current > streak.longest) {
    streak.longest = streak.current;
  }

  streak.lastCompletedDate = today;
  saveAll();
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
let sessionMode = "normal";      // "normal" | "due" | "weak" | "newBlock"
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

// ヒント・解説エリア
const hintButtonsEl = document.getElementById("hintButtons");
const hint1BtnEl = document.getElementById("hint1Btn");
const hint2BtnEl = document.getElementById("hint2Btn");
const hintAreaEl = document.getElementById("hintArea");
const explainAreaEl = document.getElementById("explainArea");
const explainMeaningEl = document.getElementById("explainMeaning");
const explainNuanceEl = document.getElementById("explainNuance");
const explainGrammarEl = document.getElementById("explainGrammar");
const similarsAreaEl = document.getElementById("similarsArea");

/*************************************************
 * Daily Missions: 苦手問題30問抽出
 *************************************************/
function getWeakCards30() {
  const currentLevel = prefs.level;

  // 全カードにスコアを付与
  const scored = cards.map(card => {
    const rec = srs[card.no]?.[currentLevel];
    let score = 0;

    if (!rec) {
      // 未学習: 基本スコア 10
      score = 10;
    } else {
      // ========== 最終評価 ==========
      if (rec.lastGrade === 1) score += 100;      // Again: 超重要
      else if (rec.lastGrade === 2) score += 50;  // Hard: 重要
      else if (rec.lastGrade === 3) score += 5;   // Easy: 復習候補

      // ========== 失敗率 ==========
      const attempts = rec.attempts || 1;
      const againCount = rec.againCount || 0;
      const hardCount = rec.hardCount || 0;
      const failRate = (againCount + hardCount) / attempts;
      score += failRate * 30;

      // ========== 挑戦回数 ==========
      // 何度やっても苦手 = スコア高
      if (attempts >= 5 && rec.lastGrade < 3) {
        score += 20;
      }

      // ========== 最終学習日 ==========
      // 長期間放置されている = 復習必要
      if (rec.lastStudied) {
        const daysSince = (now() - rec.lastStudied) / DAY;
        if (daysSince > 14) score += 15;
        else if (daysSince > 7) score += 10;
      }
    }

    return { ...card, weakScore: score };
  });

  // スコア降順でソート → 上位30問
  return scored
    .sort((a, b) => b.weakScore - a.weakScore)
    .slice(0, 30);
}

// 次の未学習ブロックを取得
function getNextUnstudiedBlock() {
  const maxBlock = getMaxBlock();
  const currentLevel = prefs.level;

  for (let b = 1; b <= maxBlock; b++) {
    const blockCards = getCardsByBlock(b);
    const hasUnstudied = blockCards.some(c => !srs[c.no]?.[currentLevel]);
    if (hasUnstudied) return b;
  }

  return 1; // フォールバック
}

/*************************************************
 * Views
 *************************************************/
function showHome() {
  homeView.classList.remove("hidden");
  studyView.classList.add("hidden");
  statsView.classList.add("hidden");
  renderLearningStats();
  renderDailyMissions();
  renderProgress();
  renderBlockTable();
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

function showLanding() {
  const landingView = document.getElementById("landingView");
  if (!landingView) return;

  homeView.classList.add("hidden");
  studyView.classList.add("hidden");
  statsView.classList.add("hidden");
  landingView.classList.remove("hidden");
}

function resetCardView() {
  revealed = false;
  showNote = false;
  hint1Shown = false;
  hint2Shown = false;
  if (hintAreaEl) hintAreaEl.textContent = "";
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
      // cols[3] はslots列（削除済み）
      const video = (cols[4] || "").trim();
      const lv = Number((cols[5] || "1").trim());
      const note = (cols[6] || "").trim();
      const scene = (cols[7] || "").trim();

      // 拡張フィールド
      const hint_1 = (cols[8] || "").trim();
      const hint_2 = (cols[9] || "").trim();
      const explain_meaning = (cols[10] || "").trim();
      const explain_nuance = (cols[11] || "").trim();
      const explain_grammar = (cols[12] || "").trim();
      const similarsRaw = (cols[13] || "").trim();

      // 類似表現のパース
      let similars = null;
      if (similarsRaw) {
        similars = similarsRaw.split("|").map(s => s.trim()).filter(Boolean);
        if (!similars.length) similars = null;
      }

      return {
        no, jp, en, video, lv, note, scene,
        hint_1, hint_2, explain_meaning, explain_nuance, explain_grammar, similars
      };
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
    // Add timestamp to bust cache
    const url = file.includes('?') ? `${file}&_t=${Date.now()}` : `${file}?_t=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
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
  const loadingOverlay = document.getElementById("loadingOverlay");
  const loadingMessage = document.getElementById("loadingMessage");

  // Initial loading message
  if (loadingMessage) {
    loadingMessage.innerHTML = 'Loading English cards<span class="dots"></span>';
  }

  cards = [];
  await loadVideosMeta();

  const MAX_VIDEO = 50;
  const MAX_BLOCK = 50;
  const MISS_LIMIT_VIDEO = 3; // 連続で動画が無い → 終了
  const MISS_LIMIT_BLOCK = 15; // 連続でブロックが無い → 次の動画へ（video2が途中から始まる場合に対応）

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
        console.log(`❌ Failed to load: ${file} (miss count: ${missBlock})`);
        if (missBlock >= MISS_LIMIT_BLOCK) break;
        continue;
      }

      missBlock = 0;
      loadedAnyInThisVideo = true;

      const parsed = parseCSV(text);
      if (parsed.length) {
        cards.push(...parsed);
        console.log(`✅ Loaded: ${file} (${parsed.length} questions)`);
      }
    }

    if (!loadedAnyInThisVideo) {
      missVideo++;
      if (missVideo >= MISS_LIMIT_VIDEO) break;
    } else {
      missVideo = 0;
    }
  }

  // If no CSV files found, use sample data
  if (!cards.length) {
    cards = SAMPLE_CARDS;
    console.log("⚠️ No CSV files found, using sample data");
  }

  cards.sort((a, b) => a.no - b.no);
  console.log(`📚 Total cards loaded: ${cards.length}`);

  // Change to "Preparing" message
  if (loadingMessage) {
    loadingMessage.innerHTML = 'Preparing your practice<span class="dots"></span>';
  }

  // 初期モード（ブロック）
  cardsByMode = getCardsByBlock(prefs.block || 1);
  index = 0;
  resetCardView();

  // Wait a bit for the "Preparing" message to be visible
  await new Promise(resolve => setTimeout(resolve, 500));

  // Hide loading overlay with fade out
  if (loadingOverlay) {
    loadingOverlay.classList.add("hidden");
  }

  // Wait for fade out animation to complete
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check if first visit
  const hasVisited = localStorage.getItem(VISITED_KEY);
  if (!hasVisited) {
    showLanding();
  } else {
    showHome();
  }
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

// 苦手克服モード（30問）
function startWeakMode(goStudy=false) {
  sessionMode = "weak";

  // 苦手問題30問を取得
  cardsByMode = getWeakCards30();

  // 全問Easyになるまでループ
  sessionDueSet = new Set(cardsByMode.map(c => c.no));

  index = 0;
  resetCardView();
  if (goStudy) showStudy(); else render();
}

// 新ブロックモード
function startNewBlockMode(goStudy=false) {
  const nextBlock = getNextUnstudiedBlock();
  prefs.block = nextBlock;
  saveAll();

  sessionMode = "newBlock";
  cardsByMode = getCardsByBlock(nextBlock);

  // 全問Easyになるまでループ
  sessionDueSet = new Set(cardsByMode.map(c => c.no));

  index = 0;
  resetCardView();
  if (goStudy) showStudy(); else render();
}

/*************************************************
 * 優先度スコア計算（苦手カード優先）
 *************************************************/
function calculatePriority(card) {
  const level = prefs.level;
  const rec = srs[card.no]?.[level];

  if (!rec) return 0;

  let score = 0;

  // 1. Again率（最重要）
  const againCount = rec.againCount || 0;
  const totalCount = rec.total || 1;
  const againRate = againCount / totalCount;
  score += againRate * 100; // 0-100点

  // 2. 最終評価の逆数（低い評価ほど高優先度）
  const lastGrade = rec.lastGrade || 3;
  score += (4 - lastGrade) * 20; // Again=60, Hard=40, Easy=20

  // 3. Dueからの経過時間（長いほど優先）
  if (rec.dueAt && rec.dueAt <= now()) {
    const overdueDays = (now() - rec.dueAt) / DAY;
    score += Math.min(overdueDays * 5, 30); // 最大30点
  }

  return score;
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

  // 優先度スコアでソート（高い順）
  cardsByMode = due.sort((a,b) => calculatePriority(b) - calculatePriority(a));
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

function renderLearningStats() {
  ensureDaily();

  // 連続日数
  const streakTextEl = document.getElementById("streakText");
  if (streakTextEl) {
    const current = streak.current || 0;
    streakTextEl.textContent = `${current}日連続`;
  }

  // 今日の学習記録
  const todayStatsTextEl = document.getElementById("todayStatsText");
  if (todayStatsTextEl) {
    const studiedCount = daily.stats.uniqueCards.length;
    const totalGrades = daily.stats.grades.again + daily.stats.grades.hard + daily.stats.grades.easy;
    const accuracyRate = totalGrades > 0
      ? Math.round((daily.stats.grades.easy / totalGrades) * 100)
      : 0;

    todayStatsTextEl.textContent = `今日: ${studiedCount}問 (${totalGrades}回・${accuracyRate}%)`;
  }
}

function renderDailyMissions() {
  ensureDaily();

  // Due件数
  const level = prefs.level;
  const dueCount = cards.filter(c => {
    const d = srs[c.no]?.[level]?.dueAt ?? Infinity;
    return d <= now();
  }).length;

  // 次の未学習ブロック
  const nextBlock = getNextUnstudiedBlock();

  // UI更新
  const dueCardEl = document.getElementById("missionDue");
  const weakCardEl = document.getElementById("missionWeak");
  const newBlockCardEl = document.getElementById("missionNewBlock");

  const dueCountEl = document.getElementById("missionDueCount");
  const weakCountEl = document.getElementById("missionWeakCount");
  const newBlockCountEl = document.getElementById("missionNewBlockCount");

  // Due
  if (dueCountEl) dueCountEl.textContent = `${dueCount}件`;
  if (dueCardEl) {
    if (dueCount === 0) {
      dueCardEl.classList.add("completed");
    } else {
      dueCardEl.classList.remove("completed");
    }
  }

  // 苦手克服
  if (weakCountEl) weakCountEl.textContent = `${dailyMission.progress.weak}/30`;
  if (weakCardEl) {
    if (dailyMission.completed.weak) {
      weakCardEl.classList.add("completed");
    } else {
      weakCardEl.classList.remove("completed");
    }
  }

  // 新ブロック
  if (newBlockCountEl) newBlockCountEl.textContent = `ブロック${nextBlock}`;
}

/*************************************************
 * Card rendering
 *************************************************/
function renderNote(card) {
  if (!noteEl) return;
  noteEl.textContent = (showNote && card.note) ? `💡 ${card.note}` : "";
}

/*************************************************
 * ヒント・解説表示
 *************************************************/
let hint1Shown = false;
let hint2Shown = false;

function renderHints(card) {
  if (!hintButtonsEl || !hintAreaEl) return;

  // 回答前のみヒントボタン表示
  if (!revealed && (card.hint_1 || card.hint_2)) {
    hintButtonsEl.classList.remove("hidden");

    // ヒント1ボタン
    if (card.hint_1 && !hint1Shown) {
      hint1BtnEl.classList.remove("hidden");
    } else {
      hint1BtnEl.classList.add("hidden");
    }

    // ヒント2ボタン
    if (card.hint_2 && hint1Shown && !hint2Shown) {
      hint2BtnEl.classList.remove("hidden");
    } else {
      hint2BtnEl.classList.add("hidden");
    }
  } else {
    hintButtonsEl.classList.add("hidden");
  }

  // ヒント表示エリア
  let hintText = "";
  if (hint1Shown && card.hint_1) hintText += `💡 ${card.hint_1}\n`;
  if (hint2Shown && card.hint_2) hintText += `💡💡 ${card.hint_2}\n`;
  hintAreaEl.textContent = hintText.trim();
}

function renderExplain(card) {
  if (!explainAreaEl) return;

  // 回答後のみ表示
  if (!revealed) {
    explainAreaEl.classList.add("hidden");
    return;
  }

  let hasContent = false;

  // 意味
  if (card.explain_meaning) {
    explainMeaningEl.innerHTML = `<div class="explainLabel">💬 意味</div><div class="explainContent">${card.explain_meaning}</div>`;
    hasContent = true;
  } else {
    explainMeaningEl.innerHTML = "";
  }

  // ニュアンス
  if (card.explain_nuance) {
    explainNuanceEl.innerHTML = `<div class="explainLabel">🎯 ニュアンス</div><div class="explainContent">${card.explain_nuance}</div>`;
    hasContent = true;
  } else {
    explainNuanceEl.innerHTML = "";
  }

  // 文法
  if (card.explain_grammar) {
    explainGrammarEl.innerHTML = `<div class="explainLabel">📖 文法</div><div class="explainContent">${card.explain_grammar}</div>`;
    hasContent = true;
  } else {
    explainGrammarEl.innerHTML = "";
  }

  // 類似表現
  if (card.similars && card.similars.length > 0) {
    const similarsList = card.similars.map(s => `<li>${s}</li>`).join("");
    similarsAreaEl.innerHTML = `<div class="explainLabel">🔄 類似表現</div><ul class="similarsList">${similarsList}</ul>`;
    hasContent = true;
  } else {
    similarsAreaEl.innerHTML = "";
  }

  if (hasContent) {
    explainAreaEl.classList.remove("hidden");
  } else {
    explainAreaEl.classList.add("hidden");
  }
}

function render() {
  if (!cardsByMode.length) return;

  const card = cardsByMode[index];

  // 日本語・英語をそのまま表示
  jpEl.textContent = card.jp;
  currentAnswer = card.en;

  // 表示（全レベル統一: タップして答え）
  if (!revealed) {
    enEl.textContent = "タップして答え";
  } else {
    enEl.textContent = currentAnswer;
  }

  renderNote(card);
  renderHints(card);
  renderExplain(card);
  renderProgress();
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

  // 苦手克服モード
  if (sessionMode === "weak") {
    if (sessionDueSet.size > 0) {
      rebuildDueDeck();
      alert(`苦手克服 残り ${cardsByMode.length}問。もう一周いくよ。`);
      render();
      return;
    } else {
      ensureDaily();
      dailyMission.completed.weak = true;
      saveAll();
      alert("苦手克服完了！30問全てEasyになったよ！");
      showHome();
      return;
    }
  }

  // 新ブロックモード
  if (sessionMode === "newBlock") {
    if (sessionDueSet.size > 0) {
      rebuildDueDeck();
      alert(`新ブロック 残り ${cardsByMode.length}問。もう一周いくよ。`);
      render();
      return;
    } else {
      ensureDaily();
      dailyMission.completed.newBlock = true;
      saveAll();
      alert("新ブロック完了！全問Easyになったよ！");
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
 * All Missions Completed Check
 *************************************************/
function checkAllMissionsCompleted() {
  ensureDaily();

  // Due完了判定（Due=0件で自動完了）
  const level = prefs.level;
  const dueCount = cards.filter(c => {
    const d = srs[c.no]?.[level]?.dueAt ?? Infinity;
    return d <= now();
  }).length;

  if (dueCount === 0) {
    dailyMission.completed.due = true;
  }

  // 3つ全て完了チェック
  const allCompleted =
    dailyMission.completed.due &&
    dailyMission.completed.weak &&
    dailyMission.completed.newBlock;

  if (allCompleted) {
    updateStreakOnComplete();
  }
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

  // SRS記録
  rec.total = (rec.total || 0) + 1;
  if (grade === 1) {
    rec.againCount = (rec.againCount || 0) + 1;
  } else if (grade === 3) {
    rec.easy = (rec.easy || 0) + 1;
  }

  rec.lastGrade = grade;
  rec.intervalMs = nextIntervalMs(grade);
  rec.dueAt = now() + rec.intervalMs;

  // 今日の学習記録を更新
  ensureDaily();
  if (!daily.stats.uniqueCards.includes(card.no)) {
    daily.stats.uniqueCards.push(card.no);
  }
  if (grade === 1) {
    daily.stats.grades.again++;
  } else if (grade === 2) {
    daily.stats.grades.hard++;
  } else if (grade === 3) {
    daily.stats.grades.easy++;
  }

  saveAll();

  // DueSet管理（全モード共通）
  if (sessionMode === "normal") {
    // 1周目: again/hard => Due追加
    if (grade === 1 || grade === 2) {
      sessionDueSet.add(card.no);
    }
  } else if (sessionMode === "due" || sessionMode === "weak" || sessionMode === "newBlock") {
    // 2周目以降: again/hard => DueSetに残す, easy => Dueから外す
    if (grade === 3) {
      sessionDueSet.delete(card.no);
    }
  }

  // Progress更新（weak/newBlockモード）
  if (sessionMode === "weak") {
    ensureDaily();
    dailyMission.progress.weak = 30 - sessionDueSet.size;
    saveAll();
  } else if (sessionMode === "newBlock") {
    ensureDaily();
    const initialSize = cardsByMode.length;
    dailyMission.progress.newBlock = initialSize - sessionDueSet.size;
    saveAll();
  }

  // 既存の進捗加算（easyだけ進む、など）
  if (grade === 3) {
    ensureDaily();
    daily.goodCount = (daily.goodCount || 0) + 1;
    saveAll();
  }

  // 全ミッション完了チェック
  checkAllMissionsCompleted();

  goNext();
}

/*************************************************
 * Events
 *************************************************/
// Landing page "Start Now" button
const startNowBtn = document.getElementById("startNowBtn");
if (startNowBtn) {
  startNowBtn.addEventListener("click", () => {
    localStorage.setItem(VISITED_KEY, "true");
    showHome();
  });
}

// Daily Mission buttons
const missionDueBtn = document.getElementById("missionDueBtn");
const missionWeakBtn = document.getElementById("missionWeakBtn");
const missionNewBlockBtn = document.getElementById("missionNewBlockBtn");

if (missionDueBtn) {
  missionDueBtn.addEventListener("click", () => {
    const level = prefs.level;
    const dueCount = cards.filter(c => {
      const d = srs[c.no]?.[level]?.dueAt ?? Infinity;
      return d <= now();
    }).length;
    if (dueCount > 0) {
      startReviewDue(true);
    }
  });
}

if (missionWeakBtn) {
  missionWeakBtn.addEventListener("click", () => {
    if (!dailyMission.completed.weak) {
      startWeakMode(true);
    }
  });
}

if (missionNewBlockBtn) {
  missionNewBlockBtn.addEventListener("click", () => {
    startNewBlockMode(true);
  });
}

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

// ヒントボタン
if (hint1BtnEl) hint1BtnEl.addEventListener("click", () => {
  hint1Shown = true;
  render();
});

if (hint2BtnEl) hint2BtnEl.addEventListener("click", () => {
  hint2Shown = true;
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
