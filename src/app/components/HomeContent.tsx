'use client'

import { Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Lightbulb } from 'lucide-react'
import { Lora } from 'next/font/google'
import PhraseCard from './PhraseCard'
import DailyProverb from './DailyProverb'
import PastArchive from './PastArchive'
import LevelTabs from './LevelTabs'
import { Level, DEFAULT_LEVEL, isValidLevel } from '../types'

const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

interface Phrase {
  id: string
  phrase: string
  blankWord?: string
  meaning: string
  nuance: string
  examples: { english: string; japanese: string }[]
  generated_at: string
  level?: string
}

interface Proverb {
  english: string
  japanese: string
}

interface HomeContentProps {
  phrases: Record<Level, Phrase | null>  // レベル別フレーズ
  proverb: Proverb | null
  pastPhrases: Record<Level, Record<string, { phrase: string; blankWord: string }>>  // レベル別過去フレーズ
}

function HomeContentInner({ phrases, proverb, pastPhrases }: HomeContentProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const levelParam = searchParams.get('level')
  const selectedLevel: Level = isValidLevel(levelParam) ? levelParam : DEFAULT_LEVEL

  const currentPhrase = phrases[selectedLevel]
  const currentPastPhrases = pastPhrases[selectedLevel] || {}

  const handleLevelChange = useCallback((newLevel: Level) => {
    if (newLevel === DEFAULT_LEVEL) {
      router.replace('/')
    } else {
      router.replace(`/?level=${newLevel}`)
    }
  }, [router])

  return (
    <div className="max-w-6xl mx-auto">
      {/* ヒーローセクション */}
      <section className="text-center mb-2 animate-fade-in-up">
        {/* 今日のことわざ */}
        <DailyProverb proverb={proverb || undefined} />

        <h2 className={`text-4xl font-bold text-emerald-600 font-serif mb-4 ${lora.className}`}>
          Today&apos;s Quiz
        </h2>

        {/* レベルタブ */}
        <LevelTabs
          selectedLevel={selectedLevel}
          onLevelChange={handleLevelChange}
          className="mb-6"
        />
      </section>

      {/* 最新フレーズ */}
      {currentPhrase ? (
        <PhraseCard phrase={currentPhrase} level={selectedLevel} />
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center shadow-sm">
          <Lightbulb className="w-12 h-12 text-[#ffd700] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#eab308] mb-2">
            フレーズを準備中...
          </h3>
          <p className="text-stone-600 text-sm">
            まもなく最初のフレーズが配信されます。お楽しみに！
          </p>
        </div>
      )}

      {/* 過去の格言、クイズ */}
      <PastArchive pastPhrases={currentPastPhrases} selectedLevel={selectedLevel} onLevelChange={handleLevelChange} />
    </div>
  )
}

export default function HomeContent(props: HomeContentProps) {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <HomeContentInner {...props} />
    </Suspense>
  )
}
