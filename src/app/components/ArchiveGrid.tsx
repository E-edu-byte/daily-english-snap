'use client'

import Link from 'next/link'
import { Calendar, ArrowRight, Sparkles } from 'lucide-react'

interface ArchivePhrase {
  id: string
  phrase: string
  meaning: string
  generated_at: string
}

export default function ArchiveGrid({ phrases }: { phrases: ArchivePhrase[] }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 最新のフレーズ（index 0）には特別なバッジを表示
  const isLatest = (index: number) => index === 0

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {phrases.map((phrase, index) => (
        <Link
          key={phrase.id}
          href={`/phrase/${phrase.id}`}
          className={`group relative bg-gradient-to-br from-white to-stone-50 rounded-3xl p-8 shadow-sm border-2 border-stone-200 hover:shadow-xl hover:border-[#ffed4e] hover:-translate-y-2 transition-all duration-300 animate-fade-in-up animate-delay-${Math.min(index, 2) * 100}`}
        >
          {/* 最新バッジ */}
          {isLatest(index) && (
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#ffed4e] to-[#ffd700] text-amber-900 px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>NEW</span>
            </div>
          )}

          {/* 日付バッジ */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-6 pb-3 border-b border-stone-200">
            <Calendar className="w-4 h-4 text-[#ffd700]" />
            <span className="font-medium">{formatDate(phrase.generated_at)}</span>
          </div>

          {/* フレーズ */}
          <h3 className="text-2xl font-bold text-stone-900 transition-colors mb-4 font-serif leading-tight">
            {phrase.phrase}
          </h3>

          {/* 意味 */}
          <p className="text-stone-700 mb-6 leading-relaxed line-clamp-3 min-h-[4.5rem]">
            {phrase.meaning}
          </p>

          {/* もっと見るボタン */}
          <div className="flex items-center gap-2 text-sm text-emerald-600 group-hover:text-emerald-700 font-bold pt-4 border-t border-stone-200 group-hover:border-emerald-600 transition-colors">
            <span>詳しく見る</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
          </div>
        </Link>
      ))}
    </div>
  )
}
