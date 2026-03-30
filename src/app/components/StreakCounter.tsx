import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// 連続日数を計算する関数
function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0

  // 日付をJSTの日付文字列（YYYY-MM-DD）に変換してユニークにする
  const uniqueDates = Array.from(
    new Set(
      dates.map(dateStr => {
        const date = new Date(dateStr)
        // JSTに変換（UTC+9）
        const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000)
        return jstDate.toISOString().split('T')[0]
      })
    )
  ).sort((a, b) => b.localeCompare(a)) // 新しい順にソート

  // 今日の日付（JST）を取得
  const now = new Date()
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const today = jstNow.toISOString().split('T')[0]

  let streak = 0
  let currentDate = new Date(today)

  // 今日から遡って連続日数をカウント
  for (const dateStr of uniqueDates) {
    const checkDate = currentDate.toISOString().split('T')[0]

    if (dateStr === checkDate) {
      streak++
      // 1日前に戻る
      currentDate.setDate(currentDate.getDate() - 1)
    } else if (dateStr < checkDate) {
      // 日付が飛んだら終了
      break
    }
  }

  return streak
}

async function getStreak() {
  if (!supabase) {
    return 0
  }

  const { data, error } = await supabase
    .from('phrases')
    .select('generated_at')
    .order('generated_at', { ascending: false })

  if (error || !data) {
    return 0
  }

  const dates = data.map(item => item.generated_at)
  return calculateStreak(dates)
}

export default async function StreakCounter() {
  const streak = await getStreak()

  if (streak === 0) {
    return null
  }

  return (
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-2 rounded-full border-2 border-amber-300 shadow-sm animate-fade-in-up">
      <span className="text-xl">🔥</span>
      <span className="font-extrabold text-lg text-stone-900">{streak}</span>
      <span className="text-sm font-bold text-stone-900">Days Streak!</span>
    </div>
  )
}
