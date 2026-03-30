import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Target, Award } from 'lucide-react'
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
      <section className="mb-16 animate-fade-in-up animate-delay-100">
        <LearningCalendar />
      </section>

      {/* 学習のコツ */}
      <section className="grid md:grid-cols-3 gap-6 animate-fade-in-up animate-delay-200">
        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-3xl p-6 shadow-sm border-2 border-stone-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-700" />
          </div>
          <h3 className="font-bold text-lg text-[#eab308] mb-2">継続が力に</h3>
          <p className="text-stone-700 text-sm leading-relaxed">
            毎日少しずつでも続けることで、確実に英語力が向上します。
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl p-6 shadow-sm border-2 border-stone-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-amber-700" />
          </div>
          <h3 className="font-bold text-lg text-[#eab308] mb-2">小さな目標</h3>
          <p className="text-stone-700 text-sm leading-relaxed">
            1日1フレーズから始めて、無理なく習慣化していきましょう。
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl p-6 shadow-sm border-2 border-stone-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mb-4">
            <Award className="w-6 h-6 text-orange-700" />
          </div>
          <h3 className="font-bold text-lg text-[#eab308] mb-2">達成感を味わう</h3>
          <p className="text-stone-700 text-sm leading-relaxed">
            カレンダーが埋まっていく様子を見て、自分を褒めてあげましょう。
          </p>
        </div>
      </section>
    </div>
  )
}
