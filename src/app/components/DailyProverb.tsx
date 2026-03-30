'use client'

import { useState, useEffect } from 'react'
import { Volume2 } from 'lucide-react'
import { Lora } from 'next/font/google'

const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

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

export default function DailyProverb() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [dailyProverb, setDailyProverb] = useState(proverbs[0])
  const [showTranslation, setShowTranslation] = useState(false)

  useEffect(() => {
    // 日付ベースでことわざを選択
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
    const index = (dayOfYear + 1) % proverbs.length  // +1 で別バージョン
    setDailyProverb(proverbs[index])
  }, [])

  const speak = () => {
    if (typeof window === 'undefined') return

    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(dailyProverb.english)
    utterance.lang = 'en-US'
    utterance.rate = 0.85

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 md:p-8 mb-8 border border-amber-100 shadow-sm">
      <h3 className={`text-center mb-6 md:mb-8 ${lora.className}`}>
        <span className="block text-2xl md:text-4xl font-bold text-emerald-600 font-serif">Today's Proverb</span>
        <span className="block text-lg md:text-2xl font-bold text-emerald-600 mt-1">今日の格言</span>
      </h3>

      <div className="flex items-start gap-3 mb-4">
        <div className="flex-1">
          <div className="relative bg-white/60 rounded-2xl p-6 border-2 border-amber-200 shadow-sm">
            <span className="absolute -top-4 -left-2 text-6xl text-emerald-300 font-serif leading-none">"</span>
            <p className={`text-2xl font-bold text-stone-900 leading-relaxed text-center relative z-10 ${lora.className}`}>
              {dailyProverb.english}
            </p>
            <span className="absolute -bottom-4 -right-2 text-6xl text-emerald-300 font-serif leading-none">"</span>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors mb-2"
            >
              {showTranslation ? '▲' : '▼'} 翻訳を{showTranslation ? '隠す' : '見る'}
            </button>

            {showTranslation && (
              <p className={`text-2xl font-bold text-stone-700 animate-fade-in-up ${lora.className}`}>
                {dailyProverb.japanese}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={speak}
          className="hidden md:block p-3 hover:bg-amber-200 bg-amber-300/90 rounded-full transition-all hover-scale flex-shrink-0 self-start"
          title="音声を再生"
        >
          <Volume2 className={`w-6 h-6 text-stone-900 ${isPlaying ? 'animate-pulse' : ''}`} />
        </button>
      </div>
    </div>
  )
}
