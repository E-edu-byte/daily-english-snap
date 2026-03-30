'use client'

import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import { Lora } from 'next/font/google'

const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

interface Proverb {
  english: string
  japanese: string
}

export default function DailyProverbArchive({ proverb }: { proverb: Proverb }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)

  const speak = () => {
    if (typeof window === 'undefined') return

    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(proverb.english)
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
              {proverb.english}
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
                {proverb.japanese}
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
