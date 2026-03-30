import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import LearningCalendar from '../components/LearningCalendar'

export const metadata: Metadata = {
  title: '学習カレンダー - Daily English Snap',
  description: 'あなたの英語学習の記録を可視化。毎日の習慣を継続しましょう。',
}

export default function CalendarPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* 戻るリンク */}
      <Link
        href="/"
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
        <LearningCalendar />
      </section>
    </div>
  )
}
