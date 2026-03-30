'use client'

import Link from 'next/link'
import { Calendar } from 'lucide-react'

interface ArchivePhrase {
  id: string
  phrase: string
  meaning: string
  generated_at: string
}

export default function ArchiveList({ phrases }: { phrases: ArchivePhrase[] }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="divide-y divide-stone-200">
        {phrases.map((phrase) => (
          <Link
            key={phrase.id}
            href={`/phrase/${phrase.id}`}
            className="block px-6 py-4 hover:bg-stone-50 transition-colors group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#ca8a04] group-hover:text-[#facc15] transition-colors mb-1">
                  {phrase.phrase}
                </h3>
                <p className="text-sm text-stone-600 truncate">{phrase.meaning}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500 flex-shrink-0">
                <Calendar className="w-4 h-4" />
                {formatDate(phrase.generated_at)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
