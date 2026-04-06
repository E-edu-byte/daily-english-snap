'use client'

import { Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Lora } from 'next/font/google'
import PhraseCard from '../../components/PhraseCard'
import DailyProverbArchive from '../../components/DailyProverbArchive'
import PastArchive from '../../components/PastArchive'
import LevelTabs from '../../components/LevelTabs'
import { Level, DEFAULT_LEVEL, isValidLevel } from '../../types'

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

interface ArchiveDateContentProps {
  dateStr: string
  formattedDate: string
  phrases: Record<Level, Phrase | null>
  proverb: Proverb | null
  pastPhrases: Record<Level, Record<string, { phrase: string; blankWord: string }>>
}

function ArchiveDateContentInner({
  dateStr,
  formattedDate,
  phrases,
  proverb,
  pastPhrases
}: ArchiveDateContentProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const levelParam = searchParams.get('level')
  const selectedLevel: Level = isValidLevel(levelParam) ? levelParam : DEFAULT_LEVEL

  const currentPhrase = phrases[selectedLevel]
  const currentPastPhrases = pastPhrases[selectedLevel] || {}

  const handleLevelChange = useCallback((newLevel: Level) => {
    if (newLevel === DEFAULT_LEVEL) {
      router.replace(`/archive/${dateStr}`)
    } else {
      router.replace(`/archive/${dateStr}?level=${newLevel}`)
    }
  }, [router, dateStr])

  // トップページへのリンク（レベル維持）
  const getHomeLink = () => {
    if (selectedLevel === DEFAULT_LEVEL) {
      return '/'
    }
    return `/?level=${selectedLevel}`
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 戻るボタン */}
      <Link
        href={getHomeLink()}
        className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">トップに戻る</span>
      </Link>

      {/* 日付ヘッダー */}
      <div className="text-center mb-8">
        <p className="text-stone-500 text-sm mb-2">アーカイブ</p>
        <h1 className={`text-2xl md:text-3xl font-bold text-stone-800 ${lora.className}`}>
          {formattedDate}
        </h1>
      </div>

      {/* ことわざ */}
      {proverb && <DailyProverbArchive proverb={proverb} />}

      {/* フレーズ */}
      <h2 className={`text-2xl md:text-4xl font-bold text-emerald-600 font-serif mb-4 text-center ${lora.className}`}>
        Today&apos;s Quiz
      </h2>

      {/* レベルタブ */}
      <LevelTabs
        selectedLevel={selectedLevel}
        onLevelChange={handleLevelChange}
        className="mb-6"
      />
      {currentPhrase && (
        <PhraseCard phrase={currentPhrase} date={dateStr} level={selectedLevel} />
      )}

      {/* 過去の格言・クイズ */}
      <PastArchive pastPhrases={currentPastPhrases} selectedLevel={selectedLevel} onLevelChange={handleLevelChange} />
    </div>
  )
}

export default function ArchiveDateContent(props: ArchiveDateContentProps) {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <ArchiveDateContentInner {...props} />
    </Suspense>
  )
}
