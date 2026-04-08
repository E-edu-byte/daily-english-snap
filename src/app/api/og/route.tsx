import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

type Level = 'high_school' | 'business' | 'advanced'

const LEVEL_LABELS: Record<Level, string> = {
  high_school: '高校英語',
  business: 'ビジネス',
  advanced: '上級',
}

const LEVEL_COLORS: Record<Level, string> = {
  high_school: '#10b981', // emerald
  business: '#3b82f6',    // blue
  advanced: '#8b5cf6',    // purple
}

// モックフレーズ（Supabase接続できない場合のフォールバック）
const mockPhrases: Record<Level, { phrase: string; blankWord: string; meaning: string }> = {
  high_school: {
    phrase: "Sounds good!",
    blankWord: "good",
    meaning: "いいね！それでいこう",
  },
  business: {
    phrase: "I'll circle back on this.",
    blankWord: "circle",
    meaning: "この件は後で改めて連絡します",
  },
  advanced: {
    phrase: "It's a double-edged sword.",
    blankWord: "sword",
    meaning: "諸刃の剣だね",
  },
}

function isValidLevel(level: string | null): level is Level {
  return level === 'high_school' || level === 'business' || level === 'advanced'
}

async function getPhrase(level: Level, date?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return mockPhrases[level]
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    let query = supabase
      .from('phrases')
      .select('phrase, blank_word, meaning, generated_at')
      .eq('level', level)

    if (date) {
      // 指定日付のフレーズを取得（JST基準）
      const startOfDay = `${date}T00:00:00+09:00`
      const endOfDay = `${date}T23:59:59+09:00`
      query = query
        .gte('generated_at', startOfDay)
        .lte('generated_at', endOfDay)
    }

    const { data, error } = await query
      .order('generated_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return mockPhrases[level]
    }

    return {
      phrase: data.phrase,
      blankWord: data.blank_word,
      meaning: data.meaning,
    }
  } catch {
    return mockPhrases[level]
  }
}

// フレーズを穴埋め形式に変換
function createBlankPhrase(phrase: string, blankWord: string): string {
  if (!blankWord) return phrase
  const blank = '???'
  return phrase.replace(blankWord, blank)
}

export async function GET(request: NextRequest) {
  // URLパラメータから日付とレベルを取得
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('d')
  const levelParam = searchParams.get('level')
  const level: Level = isValidLevel(levelParam) ? levelParam : 'high_school'

  // 日付が指定されていればその日のフレーズ、なければ最新
  const phraseData = await getPhrase(level, date || undefined)
  const blankPhrase = createBlankPhrase(phraseData.phrase, phraseData.blankWord || '')
  const levelLabel = LEVEL_LABELS[level]
  const levelColor = LEVEL_COLORS[level]

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 50%, #fde68a 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '48px' }}>📖</span>
          <span
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#292524',
            }}
          >
            Daily English Snap
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: levelColor,
              color: 'white',
              padding: '12px 32px',
              borderRadius: '50px',
              fontSize: '28px',
              fontWeight: 'bold',
            }}
          >
            {"Today's Quiz"}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              color: levelColor,
              padding: '8px 20px',
              borderRadius: '50px',
              fontSize: '22px',
              fontWeight: 'bold',
              border: `3px solid ${levelColor}`,
            }}
          >
            {levelLabel}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#ffed4e',
            padding: '48px 64px',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '4px solid #eab308',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '56px',
              fontWeight: 'bold',
              color: '#292524',
              marginBottom: '24px',
            }}
          >
            {blankPhrase}
          </div>

          <div
            style={{
              fontSize: '32px',
              color: '#44403c',
            }}
          >
            {phraseData.meaning}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '32px',
            fontSize: '24px',
            color: '#78716c',
          }}
        >
          english.news-navi.jp {date ? `| ${date}` : ''}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
