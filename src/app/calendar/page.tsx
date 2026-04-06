import type { Metadata } from 'next'
import CalendarContent from './CalendarContent'

export const metadata: Metadata = {
  title: '学習カレンダー - Daily English Snap',
  description: 'あなたの英語学習の記録を可視化。毎日の習慣を継続しましょう。',
}

export default function CalendarPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <CalendarContent />
    </div>
  )
}
