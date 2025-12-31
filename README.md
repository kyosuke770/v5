# Instant English

iPhoneだけで回す瞬間英作文アプリ

## 概要

間隔反復学習（SRS）を使って英語フレーズを効率的に学習できるWebアプリです。
CSVファイルを追加するだけで、自分だけのフレーズ集を作成できます。

## 特徴

- **3段階SRS** - シンプルな間隔反復学習システム
  - Again（5分後）- 思い出せなかった
  - Hard（6時間後）- 難しかった
  - Easy（12日後）- 簡単だった
- **レベル分け** - Lv1〜Lv3で段階的に学習
- **スロット機能** - `{x}` で穴埋めバリエーションに対応
- **シーンフィルタ** - work/daily/service など状況別に絞り込み
- **動画連携** - 動画ごとにブロック分けして学習
- **進捗管理** - 1日の学習目標とブロック進捗を可視化

## セットアップ

### 方法1: 直接開く
`index.html` をブラウザにドラッグ&ドロップ

### 方法2: ローカルサーバー
```bash
# Python 3の場合
python3 -m http.server 8000

# Python 2の場合
python -m SimpleHTTPServer 8000
```
ブラウザで `http://localhost:8000` を開く

## 使い方

### 基本的な学習フロー

1. **ホーム画面でモードを選ぶ**
   - 「復習（Due）」- 復習タイミングが来たカードを学習
   - 「動画順モード」- 動画の順番通りに全カードを学習
   - 「ブロック一覧」- 特定の範囲とレベルを選んで学習

2. **カードで学習**
   - 日本語を見て英語を考える
   - 「次へ」をタップして答えを表示
   - 3段階で自己評価する

3. **レベルを切り替え**
   - 学習画面の上部で Lv1/Lv2/Lv3 を切り替え可能

### 学習モード

- **通常モード** - 選択した範囲を1周
- **Dueモード** - 復習タイミングが来たカードのみ
- **シーンフィルタ** - 特定のシーン（work/daily/service等）だけ学習

## データの追加

### 1. CSVファイルを作成

`/data` フォルダに以下の形式でCSVファイルを追加：

```csv
no,jp,en,slots,video,lv,note,scene
1,すぐに終わらせますね。,I'll be quick.,,1,1,相手を待たせずに手短に済ませる時。,work
2,もう少しで{x}。,I'm almost {x}.,終わりです=done|準備ができます=ready,1,2,almost は完了直前の定番。,daily
3,お待たせしました。,Sorry for the wait.,,1,1,フォーマルなら Thank you for waiting.,service
```

### 2. CSVフォーマット

| カラム | 説明 | 必須 | 例 |
|--------|------|------|-----|
| `no` | カード番号（ユニーク） | ✅ | 1 |
| `jp` | 日本語フレーズ | ✅ | すぐに終わらせますね。 |
| `en` | 英語フレーズ | ✅ | I'll be quick. |
| `slots` | 穴埋めバリエーション | ❌ | 終わりです=done\|準備ができます=ready |
| `video` | 動画番号 | ✅ | 1 |
| `lv` | レベル（1-3） | ✅ | 1 |
| `note` | メモ・ヒント | ❌ | 相手を待たせずに手短に済ませる時。 |
| `scene` | シーン | ❌ | work |

### 3. スロット機能

英語に `{x}` を入れると、複数のバリエーションを練習できます：

```csv
no,jp,en,slots,video,lv,note,scene
7,少し{x}ありますか？,Do you have {x}?,時間=a minute|少し時間=a second,1,2,会話の切り出しに使う。,work
```

この場合、以下の2つが練習できます：
- 少し時間ありますか？ → Do you have a minute?
- 少し少し時間ありますか？ → Do you have a second?

### 4. 動画メタデータ（オプション）

`/data/videos.csv` で動画情報を管理：

```csv
video,title,url
1,瞬間英作文フレーズ集①,https://m.youtube.com/watch?v=ZpZW-R7yjkc
2,自作フレーズ集,
```

## データ保存

学習進捗は**ブラウザのlocalStorage**に保存されます。

### 注意点
- ブラウザのキャッシュをクリアすると進捗が消える
- 別のブラウザでは進捗が引き継がれない
- 定期的なバックアップを推奨（将来的にエクスポート機能を追加予定）

### 保存されるデータ
- 各カードのSRS状態（次回復習日時、前回の評価）
- 1日の学習進捗（今日何カード学習したか）
- ユーザー設定（最後に選んだレベルとブロック）

## ファイル構成

```
/
├── index.html          # メインHTML
├── app.js              # アプリロジック
├── style.css           # スタイル
├── data/
│   ├── videos.csv      # 動画メタデータ
│   ├── video01_001-030.csv
│   ├── video01_031-060.csv
│   └── ...             # 追加のCSVファイル
└── README.md           # このファイル
```

## カスタマイズ

### 1日の学習目標を変更

`app.js` の初期設定を変更：

```javascript
let daily = JSON.parse(localStorage.getItem(DAILY_KEY) || "null") || {
  day: new Date().toDateString(),
  goodCount: 0,
  goal: 10  // ← ここを変更（デフォルト: 10）
};
```

### SRS間隔を変更

`app.js` の `nextIntervalMs` 関数を編集：

```javascript
function nextIntervalMs(grade) {
  switch (grade) {
    case 1: return 5 * MIN;    // Again: 5分
    case 2: return 6 * HOUR;   // Hard: 6時間
    case 3: return 12 * DAY;   // Easy: 12日
    default: return 12 * DAY;
  }
}
```

## ブラウザ対応

- Chrome / Safari / Edge - 推奨
- Firefox - 動作確認済み
- iOS Safari - 動作確認済み（iPhoneでの利用を想定）

## ライセンス

自由に使用・改変してください。

## 今後の予定

- [ ] データエクスポート/インポート機能
- [ ] 学習統計・グラフ表示
- [ ] PWA対応（オフライン利用）
- [ ] 音声再生機能
- [ ] 苦手カード分析

---

**質問・バグ報告は Issues へ！**
