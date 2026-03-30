-- Daily English Snap のテーブル定義
-- Supabase の SQL Editor で実行してください

-- フレーズテーブル
CREATE TABLE IF NOT EXISTS phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phrase TEXT NOT NULL,
  meaning TEXT NOT NULL,
  nuance TEXT NOT NULL,
  examples JSONB NOT NULL, -- [{english: string, japanese: string}]
  quiz JSONB NOT NULL, -- {question: string, options: string[], correct: number, explanation: string}
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス: 生成日時の降順で効率的に取得
CREATE INDEX IF NOT EXISTS idx_phrases_generated_at ON phrases(generated_at DESC);

-- RLS (Row Level Security) の有効化
ALTER TABLE phrases ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り可能（公開コンテンツのため）
CREATE POLICY "Public read access" ON phrases
  FOR SELECT
  USING (true);

-- サービスロール（GitHub Actions）のみ書き込み可能
-- 注意: サービスロールキーを使用する場合、RLSはバイパスされます
CREATE POLICY "Service role insert access" ON phrases
  FOR INSERT
  WITH CHECK (true);

-- コメント追加
COMMENT ON TABLE phrases IS 'Daily English Snap: 自動生成された英語フレーズデータ';
COMMENT ON COLUMN phrases.phrase IS '英語フレーズ本文';
COMMENT ON COLUMN phrases.meaning IS '日本語訳';
COMMENT ON COLUMN phrases.nuance IS 'ニュアンスの解説';
COMMENT ON COLUMN phrases.examples IS '例文の配列（英語・日本語訳）';
COMMENT ON COLUMN phrases.quiz IS '3択クイズデータ';
COMMENT ON COLUMN phrases.generated_at IS 'フレーズ生成日時（表示用）';
