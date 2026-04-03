'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, CheckCircle2, Circle } from 'lucide-react'
import { Lora } from 'next/font/google'

const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

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

// 日付からことわざを取得
function getProverbForDate(date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
  const index = (dayOfYear + 1) % proverbs.length
  return proverbs[index]
}

// フレーズリスト（穴埋めクイズ用）- フォールバック
const fallbackPhrases = [
  { phrase: "Sounds good.", blankWord: "good" },
  { phrase: "I'm on my way.", blankWord: "way" },
  { phrase: "Let me check.", blankWord: "check" },
  { phrase: "No worries.", blankWord: "worries" },
  { phrase: "I'll get back to you.", blankWord: "back" },
  { phrase: "That makes sense.", blankWord: "sense" },
  { phrase: "I'm not sure.", blankWord: "sure" },
  { phrase: "Could you say that again?", blankWord: "again" },
  { phrase: "It depends.", blankWord: "depends" },
  { phrase: "I'll figure it out.", blankWord: "figure" },
]

// 日付からフォールバックフレーズを取得
function getFallbackPhraseForDate(date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
  const index = (dayOfYear + 1) % fallbackPhrases.length
  return fallbackPhrases[index]
}

// フレーズを穴埋め形式に変換
function createBlankPhrase(phrase: string, blankWord: string): string {
  if (!blankWord) return phrase
  return phrase.replace(blankWord, '???')
}

// 過去N日間の日付を取得
function getPastDates(days: number) {
  const dates = []
  const today = new Date()
  for (let i = 1; i <= days; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    dates.push(date)
  }
  return dates
}

export default function ArchiveIndexPage() {
  const pastDates = getPastDates(30)  // 30日分表示
  const [doneStates, setDoneStates] = useState<Record<string, boolean>>({})

  const formatDateForUrl = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDateForStorage = (date: Date) => {
    return formatDateForUrl(date)
  }

  useEffect(() => {
    const records = JSON.parse(localStorage.getItem('learningRecords') || '{}')
    const states: Record<string, boolean> = {}
    pastDates.forEach(date => {
      const dateKey = formatDateForStorage(date)
      states[dateKey] = records[dateKey] && records[dateKey].length > 0
    })
    setDoneStates(states)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 戻るボタン */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">トップに戻る</span>
      </Link>

      {/* ヘッダー */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <Calendar className="w-7 h-7 text-emerald-500" />
          <h1 className={`text-3xl font-bold text-emerald-600 font-serif ${lora.className}`}>
            過去の格言・クイズ
          </h1>
        </div>
        <p className="text-stone-600">
          過去30日分のアーカイブ
        </p>
      </div>

      {/* アーカイブ一覧 */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {pastDates.map((date, index) => {
          const dateKey = formatDateForStorage(date)
          const isDone = doneStates[dateKey] || false
          const proverb = getProverbForDate(date)
          const phraseData = getFallbackPhraseForDate(date)
          const blankPhrase = createBlankPhrase(phraseData.phrase, phraseData.blankWord)

          return (
            <Link
              key={index}
              href={`/archive/${formatDateForUrl(date)}`}
              className="block border-b border-stone-100 last:border-b-0 hover:bg-amber-50 transition-colors"
            >
              <div className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                {/* 日付 */}
                <div className="flex-shrink-0 w-24 md:w-28">
                  <p className="text-xs md:text-sm font-bold text-stone-700">
                    {formatDate(date)}
                  </p>
                </div>

                {/* 格言（PC版のみ） */}
                <div className="hidden md:block flex-1 min-w-0">
                  <p className="text-sm text-stone-600 truncate">
                    <span className="text-amber-600 font-medium">格言：</span>
                    <span className="text-stone-700">{proverb.english}</span>
                  </p>
                </div>

                {/* スマホ版の穴埋めフレーズ */}
                <div className="flex-1 md:hidden min-w-0">
                  <p className="text-xs text-stone-500 truncate">{blankPhrase}</p>
                </div>

                {/* クイズ + Doneマーク */}
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                  <span className="text-xs md:text-sm text-emerald-600 font-medium">
                    <span className="hidden md:inline">クイズ：</span>
                    <span className="md:hidden">学習</span>
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4 md:w-5 md:h-5 text-stone-300" />
                  )}
                </div>

                {/* 矢印 */}
                <div className="text-stone-400 flex-shrink-0 text-sm">
                  →
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
