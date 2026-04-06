'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import LearningCalendar from '../components/LearningCalendar'
import { Level, DEFAULT_LEVEL, isValidLevel } from '../types'

function CalendarContentInner() {
  const searchParams = useSearchParams()
  const levelParam = searchParams.get('level')
  const initialLevel: Level = isValidLevel(levelParam) ? levelParam : DEFAULT_LEVEL

  // トップページへのリンク（レベル維持）
  const getHomeLink = () => {
    if (initialLevel === DEFAULT_LEVEL) {
      return '/'
    }
    return `/?level=${initialLevel}`
  }

  return (
    <>
      {/* 戻るリンク */}
      <Link
        href={getHomeLink()}
        className="inline-flex items-center gap-2 text-[#eab308] hover:text-[#ffed4e] transition-colors mb-8 font-medium hover-scale"
      >
        <ArrowLeft className="w-4 h-4" />
        ホームに戻る
      </Link>

      {/* ヘッダー */}
      <section className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold text-[#eab308] mb-4 font-serif">
          Learning Calendar
        </h1>
        <p className="text-stone-600 text-lg max-w-2xl mx-auto">
          毎日の学習記録を可視化して、継続のモチベーションを高めましょう。<br />
          フレーズを学習したら「Done」ボタンを押して記録を残せます。
        </p>
        <p className="text-stone-400 text-xs mt-3">
          ※ブラウザのデータを消去すると、記録も削除されるのでご注意ください
        </p>
      </section>

      {/* カレンダー */}
      <section className="animate-fade-in-up animate-delay-100">
        <LearningCalendar initialLevel={initialLevel} />
      </section>
    </>
  )
}

export default function CalendarContent() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <CalendarContentInner />
    </Suspense>
  )
}
