import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import HomeContent from './components/HomeContent'
import { Level, LEVELS, DEFAULT_LEVEL } from './types'

// 動的メタデータ生成（OGP画像のURL - 日付とレベル対応）
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; d?: string }>
}): Promise<Metadata> {
  const params = await searchParams

  // 日付: パラメータがあればそれを使用、なければ今日
  let dateStr = params.d
  if (!dateStr) {
    const now = new Date()
    const jstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    dateStr = jstDate.toISOString().split('T')[0]
  }

  // レベル: パラメータがあればそれを使用
  const level = params.level || DEFAULT_LEVEL

  // OG画像URLにレベルと日付を含める
  const ogParams = new URLSearchParams()
  ogParams.set('d', dateStr)
  if (level !== DEFAULT_LEVEL) {
    ogParams.set('level', level)
  }
  const ogUrl = `https://english.news-navi.jp/api/og?${ogParams.toString()}`

  return {
    openGraph: {
      images: [{
        url: ogUrl,
        width: 1200,
        height: 630,
        alt: "Today's Quiz - Daily English Snap",
      }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogUrl],
    },
  }
}

// Supabase クライアント（サーバーサイド）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export const revalidate = 300 // 5分ごとに再検証

// ローカル開発用モックデータ（レベル別）
const mockPhrasesBase = {
  high_school: {
    id: 'mock-hs-1',
    phrase: "Sounds good.",
    blankWord: "good",
    meaning: "いいね、分かった、それでいこう",
    nuance: "相手からの提案、計画、アイデアなどに対して「良いね」「賛成」「それで大丈夫」と肯定的に返答する際に使います。カジュアルからビジネスまで幅広い場面で使えます。",
    examples: [
      { english: "A: How about we meet at 7 PM for dinner?\nB: Sounds good. I'll make a reservation.", japanese: "A: 夕食に7時でどう？\nB: いいね。予約しておくよ。" },
      { english: "A: Let's wrap up the meeting here.\nB: Sounds good to me.", japanese: "A: ここで会議を終わりにしましょう。\nB: いいですね。" }
    ],
    generated_at: new Date().toISOString(),
    level: 'high_school'
  },
  business: {
    id: 'mock-biz-1',
    phrase: "I'll circle back on this.",
    blankWord: "circle",
    meaning: "この件について後で改めて連絡します",
    nuance: "ビジネスミーティングで、今すぐ答えられない案件について後で検討・対応することを伝える表現。プロフェッショナルな印象を与えます。",
    examples: [
      { english: "A: What's the status of the budget approval?\nB: I'll circle back on this after I speak with finance.", japanese: "A: 予算承認の状況はどうですか？\nB: 財務と話した後、改めてご連絡します。" },
      { english: "A: Can you give us an update on the project?\nB: Let me circle back on this by end of day.", japanese: "A: プロジェクトの進捗を教えてもらえますか？\nB: 本日中に改めてご報告します。" }
    ],
    generated_at: new Date().toISOString(),
    level: 'business'
  },
  advanced: {
    id: 'mock-adv-1',
    phrase: "It's a double-edged sword.",
    blankWord: "sword",
    meaning: "諸刃の剣だね、良い面と悪い面がある",
    nuance: "何かが利点と欠点の両方を持つことを表現するイディオム。上級者向けの洗練された比喩表現で、ディスカッションや分析的な会話でよく使われます。",
    examples: [
      { english: "A: Social media has made communication so much easier.\nB: True, but it's a double-edged sword. Privacy concerns are real.", japanese: "A: SNSでコミュニケーションがとても簡単になったよね。\nB: 確かに、でも諸刃の剣だね。プライバシーの問題は深刻だよ。" },
      { english: "A: Working from home sounds perfect.\nB: It's a double-edged sword, honestly. The flexibility is great, but isolation can be tough.", japanese: "A: 在宅勤務って最高に聞こえる。\nB: 正直、諸刃の剣だよ。柔軟性はいいけど、孤立感がつらいこともある。" }
    ],
    generated_at: new Date().toISOString(),
    level: 'advanced'
  }
}

// 日付ベースでフレーズを選択
function getDailyPhrase(level: Level) {
  return mockPhrasesBase[level]
}

async function getLatestPhrases(): Promise<{
  phrases: Record<Level, typeof mockPhrasesBase.high_school | null>
  proverb: { english: string; japanese: string } | null
}> {
  // Supabaseが設定されていない場合はモックデータを使用
  if (!supabase) {
    return {
      phrases: {
        high_school: getDailyPhrase('high_school'),
        business: getDailyPhrase('business'),
        advanced: getDailyPhrase('advanced')
      },
      proverb: null
    }
  }

  try {
    // 最新の日付のフレーズを3レベル分取得
    const { data, error } = await supabase
      .from('phrases')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(10) // 最新10件取得（3レベル分+バッファ）

    if (error || !data || data.length === 0) {
      console.error('Error fetching latest phrases:', error)
      return {
        phrases: {
          high_school: getDailyPhrase('high_school'),
          business: getDailyPhrase('business'),
          advanced: getDailyPhrase('advanced')
        },
        proverb: null
      }
    }

    // 最新の日付を特定
    const latestDate = data[0].generated_at.split('T')[0]

    // レベル別にフレーズを整理
    const phrases: Record<Level, typeof mockPhrasesBase.high_school | null> = {
      high_school: null,
      business: null,
      advanced: null
    }

    let proverb: { english: string; japanese: string } | null = null

    for (const item of data) {
      const itemDate = item.generated_at.split('T')[0]
      if (itemDate !== latestDate) continue

      const level = (item.level || 'high_school') as Level
      if (!phrases[level]) {
        phrases[level] = {
          ...item,
          blankWord: item.blank_word
        }
      }

      // 格言は最初の1つだけ取得（全レベル共通）
      if (!proverb && item.proverb_english && item.proverb_japanese) {
        proverb = {
          english: item.proverb_english,
          japanese: item.proverb_japanese
        }
      }
    }

    // 足りないレベルはモックで補完
    for (const level of LEVELS) {
      if (!phrases[level]) {
        phrases[level] = getDailyPhrase(level)
      }
    }

    return { phrases, proverb }
  } catch {
    return {
      phrases: {
        high_school: getDailyPhrase('high_school'),
        business: getDailyPhrase('business'),
        advanced: getDailyPhrase('advanced')
      },
      proverb: null
    }
  }
}

// 過去7日分のフレーズを取得（レベル別）
async function getPastPhrases(): Promise<Record<Level, Record<string, { phrase: string; blankWord: string }>>> {
  const result: Record<Level, Record<string, { phrase: string; blankWord: string }>> = {
    high_school: {},
    business: {},
    advanced: {}
  }

  if (!supabase) {
    return result
  }

  try {
    // 過去7日分の日付範囲を計算
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)

    const { data, error } = await supabase
      .from('phrases')
      .select('phrase, blank_word, generated_at, level')
      .gte('generated_at', sevenDaysAgo.toISOString())
      .order('generated_at', { ascending: false })

    if (error || !data) {
      return result
    }

    // 日付・レベルごとにフレーズをマッピング
    data.forEach(item => {
      const date = new Date(item.generated_at)
      // JSTに変換
      const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000)
      const dateStr = jstDate.toISOString().split('T')[0]
      const level = (item.level || 'high_school') as Level

      if (!result[level][dateStr]) {
        result[level][dateStr] = {
          phrase: item.phrase,
          blankWord: item.blank_word || ''
        }
      }
    })

    return result
  } catch {
    return result
  }
}

export default async function Home() {
  const { phrases, proverb } = await getLatestPhrases()
  const pastPhrases = await getPastPhrases()

  return (
    <HomeContent
      phrases={phrases}
      proverb={proverb}
      pastPhrases={pastPhrases}
    />
  )
}
