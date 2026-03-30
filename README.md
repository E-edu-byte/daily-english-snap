# Daily English Snap ⚡

日常で即レスできる実用的な英語フレーズを、1日3回自動配信するWebサイトです。

## ✨ 特徴

- 🤖 **AI厳選**: Gemini AIが日常で本当に使える実用フレーズを厳選
- 📚 **例文付き**: 実際の会話シーンを想定した例文で使い方をマスター
- 🎯 **クイズで定着**: 3択クイズで理解度チェック。楽しく学習を継続
- ⏰ **1日3回自動更新**: 毎日 8:00 / 12:00 / 18:00（日本時間）に新しいフレーズを配信
- 📱 **レスポンシブ対応**: スマホでもPCでも快適に閲覧可能

## 🛠️ 技術スタック

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **UI Icons**: Lucide React
- **Deployment**: Cloudflare Pages（GitHub連携で自動デプロイ）
- **Database**: Supabase（PostgreSQL）
- **Automation**: GitHub Actions（cron）
- **AI**: Gemini API（Google AI Studio 無料枠）

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone <your-repo-url>
cd daily-english-snap
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Supabase のセットアップ

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. SQL Editor で `supabase-schema.sql` を実行してテーブルを作成
3. Settings > API から以下を取得：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 4. Gemini API の取得

1. [Google AI Studio](https://aistudio.google.com/) にアクセス
2. API キーを作成（無料枠: 20 RPD）
3. `GEMINI_API_KEY` として保存

### 5. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` に取得した値を設定してください。

### 6. ローカル起動

```bash
npm run dev
```

http://localhost:3000 でアクセス可能です。

### 7. Cloudflare Pages へのデプロイ

1. GitHub にリポジトリをプッシュ
2. [Cloudflare Dashboard](https://dash.cloudflare.com/) > Pages > Create a project
3. GitHub リポジトリを選択
4. ビルド設定:
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
5. 環境変数を設定（Supabase の URL とキー）
6. デプロイ開始

### 8. GitHub Actions の設定

GitHub リポジトリの Settings > Secrets and variables > Actions で以下を設定：

- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

これで、1日3回自動的にフレーズが生成されます。

## 📂 ディレクトリ構成

```
daily-english-snap/
├── .github/
│   └── workflows/
│       └── generate.yml        # フレーズ自動生成ワークフロー
├── scripts/
│   └── generate.mjs            # Gemini API 呼び出しスクリプト
├── src/
│   └── app/
│       ├── components/         # Reactコンポーネント
│       ├── phrase/[id]/        # 個別フレーズページ
│       ├── layout.tsx          # レイアウト（AdSense対応）
│       ├── page.tsx            # トップページ
│       └── globals.css         # グローバルCSS
├── public/                     # 静的ファイル
├── supabase-schema.sql         # データベーススキーマ
├── package.json
└── README.md
```

## 📊 Supabase テーブル構造

### `phrases` テーブル

| カラム名      | 型          | 説明                   |
|---------------|-------------|------------------------|
| id            | UUID        | プライマリキー         |
| phrase        | TEXT        | 英語フレーズ           |
| meaning       | TEXT        | 日本語訳               |
| nuance        | TEXT        | ニュアンス解説         |
| examples      | JSONB       | 例文の配列             |
| quiz          | JSONB       | クイズデータ           |
| generated_at  | TIMESTAMPTZ | フレーズ生成日時       |
| created_at    | TIMESTAMPTZ | レコード作成日時       |

## 🤖 GitHub Actions スケジュール

- **日本時間 8:00** (UTC 23:00 前日)
- **日本時間 12:00** (UTC 3:00)
- **日本時間 18:00** (UTC 9:00)

手動実行も可能です（Actions タブから "Run workflow"）。

## 💰 収益化（Google AdSense）

`src/app/layout.tsx` に AdSense の自動広告タグが用意されています。

1. AdSense でサイトを登録
2. クライアントID（`ca-pub-XXXXXXXXXX`）を取得
3. `layout.tsx` のコメントを解除し、IDを設定

## 📝 ライセンス

MIT License

## 🙌 謝辞

- AI: [Google Gemini](https://ai.google.dev/)
- Database: [Supabase](https://supabase.com/)
- Deployment: [Cloudflare Pages](https://pages.cloudflare.com/)
- Framework: [Next.js](https://nextjs.org/)

---

Enjoy learning English! 🎉
