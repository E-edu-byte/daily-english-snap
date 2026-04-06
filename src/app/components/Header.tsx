'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { Lora } from 'next/font/google'
import { DEFAULT_LEVEL, isValidLevel } from '../types'

const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

function HeaderInner() {
  const searchParams = useSearchParams()
  const levelParam = searchParams.get('level')
  const currentLevel = isValidLevel(levelParam) ? levelParam : DEFAULT_LEVEL

  // レベルを維持したリンクを生成
  const getHomeLink = () => {
    if (currentLevel === DEFAULT_LEVEL) {
      return '/'
    }
    return `/?level=${currentLevel}`
  }

  const getCalendarLink = () => {
    if (currentLevel === DEFAULT_LEVEL) {
      return '/calendar'
    }
    return `/calendar?level=${currentLevel}`
  }

  return (
    <header className="bg-[#ffed4e] shadow-sm">
      <div className="container mx-auto px-3 py-4 md:px-4 md:py-6">
        <div className="flex items-center justify-between gap-2">
          <Link href={getHomeLink()} className="hover:opacity-80 transition-opacity min-w-0 flex-1">
            <h1 className={`text-lg md:text-3xl font-extrabold text-stone-900 ${lora.className} whitespace-nowrap`} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
              📖 Daily English Snap
            </h1>
            <p className="text-xs md:text-base text-stone-800 mt-0.5 md:mt-1 font-medium pl-6 md:pl-11 whitespace-nowrap">
              １日１回の英語トレーニング
            </p>
          </Link>
          <Link
            href={getCalendarLink()}
            className="group flex items-center gap-1.5 md:gap-2 bg-white/80 hover:bg-white px-3 py-2 md:px-4 md:py-3 rounded-full border-2 border-stone-900/20 hover:border-stone-900/40 transition-all hover-scale shadow-sm flex-shrink-0"
            title="学習カレンダー"
          >
            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-stone-900" />
            <span className="text-xs md:text-sm font-bold text-stone-900 whitespace-nowrap">学習記録</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default function Header() {
  return (
    <Suspense fallback={
      <header className="bg-[#ffed4e] shadow-sm">
        <div className="container mx-auto px-3 py-4 md:px-4 md:py-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className={`text-lg md:text-3xl font-extrabold text-stone-900 ${lora.className} whitespace-nowrap`} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                📖 Daily English Snap
              </h1>
              <p className="text-xs md:text-base text-stone-800 mt-0.5 md:mt-1 font-medium pl-6 md:pl-11 whitespace-nowrap">
                １日１回の英語トレーニング
              </p>
            </div>
          </div>
        </div>
      </header>
    }>
      <HeaderInner />
    </Suspense>
  )
}
