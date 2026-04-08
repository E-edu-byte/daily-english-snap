import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PhraseCard from '../../components/PhraseCard'
import DailyProverbArchive from '../../components/DailyProverbArchive'
import PastArchive from '../../components/PastArchive'
import { Lora } from 'next/font/google'
import { Level, LEVELS, DEFAULT_LEVEL, isValidLevel } from '../../types'
import ArchiveDateContent from './ArchiveDateContent'

const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

// 動的メタデータ生成（アーカイブページ用 - 日付とレベル対応）
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ date: string }>
  searchParams: Promise<{ level?: string }>
}): Promise<Metadata> {
  const { date: dateStr } = await params
  const { level: levelParam } = await searchParams

  // レベル: パラメータがあればそれを使用
  const level = isValidLevel(levelParam) ? levelParam : DEFAULT_LEVEL

  // OG画像URLに日付とレベルを含める
  const ogParams = new URLSearchParams()
  ogParams.set('d', dateStr)
  if (level !== DEFAULT_LEVEL) {
    ogParams.set('level', level)
  }
  const ogUrl = `https://english.news-navi.jp/api/og?${ogParams.toString()}`

  // 日付をフォーマット
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const formattedDate = date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return {
    title: `${formattedDate}のクイズ - Daily English Snap`,
    description: `${formattedDate}の英語フレーズクイズ。穴埋めで楽しく学習！`,
    openGraph: {
      images: [{
        url: ogUrl,
        width: 1200,
        height: 630,
        alt: `${formattedDate} - Daily English Snap`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogUrl],
    },
  }
}

// Supabase クライアント
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export const revalidate = 300 // 5分ごとに再検証

// ことわざリスト
const proverbs = [
  { english: "Actions speak louder than words.", japanese: "行動は言葉よりも雄弁である" },
  { english: "The early bird catches the worm.", japanese: "早起きは三文の徳" },
  { english: "Practice makes perfect.", japanese: "習うより慣れよ" },
  { english: "Where there's a will, there's a way.", japanese: "意志あるところに道は開ける" },
  { english: "Time is money.", japanese: "時は金なり" },
  { english: "Knowledge is power.", japanese: "知識は力なり" },
  { english: "Better late than never.", japanese: "遅れても来ないよりまし" },
  { english: "Two heads are better than one.", japanese: "三人寄れば文殊の知恵" },
  { english: "When in Rome, do as the Romans do.", japanese: "郷に入っては郷に従え" },
  { english: "A picture is worth a thousand words.", japanese: "百聞は一見に如かず" },
  { english: "Rome wasn't built in a day.", japanese: "ローマは一日にして成らず" },
  { english: "Every cloud has a silver lining.", japanese: "どんな困難にも希望の光がある" },
  { english: "Don't count your chickens before they hatch.", japanese: "捕らぬ狸の皮算用" },
  { english: "The pen is mightier than the sword.", japanese: "ペンは剣よりも強し" },
  { english: "You can't judge a book by its cover.", japanese: "見かけで判断してはいけない" },
  { english: "All that glitters is not gold.", japanese: "光るものすべてが金とは限らない" },
  { english: "Honesty is the best policy.", japanese: "正直は最善の策" },
  { english: "A rolling stone gathers no moss.", japanese: "転石苔むさず" },
  { english: "Birds of a feather flock together.", japanese: "類は友を呼ぶ" },
  { english: "Don't put all your eggs in one basket.", japanese: "卵を一つのカゴに盛るな" },
  { english: "The grass is always greener on the other side.", japanese: "隣の芝生は青く見える" },
  { english: "Strike while the iron is hot.", japanese: "鉄は熱いうちに打て" },
  { english: "No pain, no gain.", japanese: "苦労なくして成果なし" },
  { english: "Absence makes the heart grow fonder.", japanese: "会えない時間が愛を育てる" },
  { english: "A friend in need is a friend indeed.", japanese: "困った時の友こそ真の友" },
  { english: "An apple a day keeps the doctor away.", japanese: "一日一個のりんごで医者いらず" },
  { english: "Beggars can't be choosers.", japanese: "贅沢は言えない" },
  { english: "Blood is thicker than water.", japanese: "血は水よりも濃い" },
  { english: "Curiosity killed the cat.", japanese: "好奇心は身を滅ぼす" },
  { english: "Every dog has its day.", japanese: "誰にでも全盛期がある" },
]

// モックフレーズ（レベル別）
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
    generated_at: "",
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
    generated_at: "",
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
    generated_at: "",
    level: 'advanced'
  }
}

// 日付からモックフレーズを取得（フォールバック用）
function getMockPhraseForDate(date: Date, level: Level) {
  const phrase = { ...mockPhrasesBase[level] }
  phrase.generated_at = date.toISOString()
  return phrase
}

// 日付からことわざを取得
function getProverbForDate(date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
  const index = (dayOfYear + 1) % proverbs.length
  return proverbs[index]
}

// Supabaseからその日のフレーズを取得（レベル別）
async function getPhrasesForDate(dateStr: string): Promise<{
  phrases: Record<Level, typeof mockPhrasesBase.high_school | null>
  proverb: { english: string; japanese: string } | null
}> {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  if (!supabase) {
    return {
      phrases: {
        high_school: getMockPhraseForDate(date, 'high_school'),
        business: getMockPhraseForDate(date, 'business'),
        advanced: getMockPhraseForDate(date, 'advanced')
      },
      proverb: getProverbForDate(date)
    }
  }

  try {
    // その日の開始と終了を計算（JST基準）
    const startOfDay = `${dateStr}T00:00:00+09:00`
    const endOfDay = `${dateStr}T23:59:59+09:00`

    const { data, error } = await supabase
      .from('phrases')
      .select('*')
      .gte('generated_at', startOfDay)
      .lte('generated_at', endOfDay)
      .order('generated_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return {
        phrases: {
          high_school: getMockPhraseForDate(date, 'high_school'),
          business: getMockPhraseForDate(date, 'business'),
          advanced: getMockPhraseForDate(date, 'advanced')
        },
        proverb: getProverbForDate(date)
      }
    }

    // レベル別にフレーズを整理
    const phrases: Record<Level, typeof mockPhrasesBase.high_school | null> = {
      high_school: null,
      business: null,
      advanced: null
    }

    let proverb: { english: string; japanese: string } | null = null

    for (const item of data) {
      const level = (item.level || 'high_school') as Level
      if (!phrases[level]) {
        phrases[level] = {
          ...item,
          blankWord: item.blank_word
        }
      }

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
        phrases[level] = getMockPhraseForDate(date, level)
      }
    }

    // 格言がない場合はフォールバック
    if (!proverb) {
      proverb = getProverbForDate(date)
    }

    return { phrases, proverb }
  } catch {
    return {
      phrases: {
        high_school: getMockPhraseForDate(date, 'high_school'),
        business: getMockPhraseForDate(date, 'business'),
        advanced: getMockPhraseForDate(date, 'advanced')
      },
      proverb: getProverbForDate(date)
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

    data.forEach(item => {
      const date = new Date(item.generated_at)
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

interface PageProps {
  params: Promise<{ date: string }>
}

export default async function ArchivePage({ params }: PageProps) {
  const { date: dateStr } = await params

  // 日付をパース (YYYY-MM-DD形式)
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  const { phrases, proverb } = await getPhrasesForDate(dateStr)
  const pastPhrases = await getPastPhrases()

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  return (
    <ArchiveDateContent
      dateStr={dateStr}
      formattedDate={formatDate(date)}
      phrases={phrases}
      proverb={proverb}
      pastPhrases={pastPhrases}
    />
  )
}
