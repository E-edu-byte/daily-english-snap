import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

// モックフレーズ（Supabase接続できない場合のフォールバック）
const mockPhrase = {
  phrase: "Sounds good!",
  blankWord: "good",
  meaning: "いいね！それでいこう",
}

async function getLatestPhrase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return mockPhrase
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase
      .from('phrases')
      .select('phrase, blank_word, meaning')
      .order('generated_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return mockPhrase
    }

    return {
      phrase: data.phrase,
      blankWord: data.blank_word,
      meaning: data.meaning,
    }
  } catch {
    return mockPhrase
  }
}

// フレーズを穴埋め形式に変換
function createBlankPhrase(phrase: string, blankWord: string): string {
  if (!blankWord) return phrase
  const blank = '???'
  return phrase.replace(blankWord, blank)
}

export async function GET(request: NextRequest) {
  // URLパラメータから日付を取得（キャッシュバスティング用）
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('d')

  const phraseData = await getLatestPhrase()
  const blankPhrase = createBlankPhrase(phraseData.phrase, phraseData.blankWord || '')

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
            justifyContent: 'center',
            backgroundColor: '#10b981',
            color: 'white',
            padding: '12px 32px',
            borderRadius: '50px',
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '40px',
          }}
        >
          {"Today's Quiz"}
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
