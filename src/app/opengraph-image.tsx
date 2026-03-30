import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const alt = "Today's Quiz - Daily English Snap"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

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

export default async function Image() {
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
        {/* ヘッダー */}
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

        {/* Today's Quiz ラベル */}
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
          Today&apos;s Quiz
        </div>

        {/* メインカード */}
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
          {/* 穴埋めフレーズ */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#292524',
              marginBottom: '24px',
            }}
          >
            {blankPhrase.split('???').map((part, i, arr) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {part}
                {i < arr.length - 1 && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '8px 24px',
                      borderRadius: '12px',
                      margin: '0 8px',
                      fontSize: '48px',
                      border: '3px dashed white',
                    }}
                  >
                    ???
                  </span>
                )}
              </span>
            ))}
          </div>

          {/* 意味 */}
          <div
            style={{
              fontSize: '32px',
              color: '#44403c',
            }}
          >
            {phraseData.meaning}
          </div>
        </div>

        {/* フッター */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '40px',
            fontSize: '24px',
            color: '#78716c',
          }}
        >
          english.news-navi.jp
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
