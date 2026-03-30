'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'

export default function LearningCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [learningRecords, setLearningRecords] = useState<Record<string, string[]>>({})

  // LocalStorageから学習記録を読み込み
  const loadRecords = () => {
    if (typeof window === 'undefined') return
    const records = JSON.parse(localStorage.getItem('learningRecords') || '{}')
    setLearningRecords(records)
  }

  useEffect(() => {
    loadRecords()

    // カスタムイベントをリッスンして更新
    const handleUpdate = () => loadRecords()
    window.addEventListener('learningRecordsUpdated', handleUpdate)
    return () => window.removeEventListener('learningRecordsUpdated', handleUpdate)
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // 月の最初の日と最後の日を取得
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()

  // カレンダーの日付配列を生成
  const calendarDays: (number | null)[] = []

  // 最初の週の空白を追加
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null)
  }

  // 日付を追加
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // 日付が学習済みかチェック
  const isDayCompleted = (day: number | null) => {
    if (!day) return false
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return learningRecords[dateStr] && learningRecords[dateStr].length > 0
  }

  // 今日かどうかチェック
  const isToday = (day: number | null) => {
    if (!day) return false
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  // 日付のURLを生成
  const getDateUrl = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return `/archive/${dateStr}`
  }

  // 未来の日付かどうかチェック
  const isFutureDate = (day: number | null) => {
    if (!day) return false
    const checkDate = new Date(year, month, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return checkDate > today
  }

  // 月を変更
  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1))
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="bg-gradient-to-br from-white to-stone-50 rounded-3xl p-8 shadow-sm border-2 border-stone-200">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-[#ffed4e]" />
          <h3 className="text-2xl font-bold text-[#eab308] font-serif">Learning Calendar</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-full hover:bg-amber-100 transition-colors"
            aria-label="前の月"
          >
            <ChevronLeft className="w-5 h-5 text-stone-700" />
          </button>
          <span className="text-lg font-semibold text-stone-800 min-w-[140px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded-full hover:bg-amber-100 transition-colors"
            aria-label="次の月"
          >
            <ChevronRight className="w-5 h-5 text-stone-700" />
          </button>
        </div>
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-2">
        {/* 曜日ヘッダー */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-bold text-stone-600 py-2"
          >
            {day}
          </div>
        ))}

        {/* 日付セル */}
        {calendarDays.map((day, index) => {
          const completed = isDayCompleted(day)
          const today = isToday(day)
          const future = isFutureDate(day)

          const cellContent = day && (
            <div className="flex flex-col items-center justify-center gap-1">
              <span>{day}</span>
              {completed && (
                <span className="text-lg leading-none" title="学習完了">
                  📖
                </span>
              )}
            </div>
          )

          const cellClass = `aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
            day
              ? today
                ? 'bg-[#ffed4e] text-stone-900 font-bold ring-2 ring-[#eab308] shadow-md'
                : completed
                ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-stone-800 shadow-sm'
                : future
                ? 'bg-white text-stone-300'
                : 'bg-white text-stone-600 hover:bg-amber-50 cursor-pointer'
              : ''
          }`

          // 未来の日付はリンクなし
          if (!day || future) {
            return (
              <div key={index} className={cellClass}>
                {cellContent}
              </div>
            )
          }

          // 今日または過去の日付はリンクあり
          return (
            <Link
              key={index}
              href={getDateUrl(day)}
              className={cellClass}
            >
              {cellContent}
            </Link>
          )
        })}
      </div>

      {/* 凡例 */}
      <div className="mt-6 pt-6 border-t border-stone-200 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#ffed4e] rounded-lg ring-2 ring-[#eab308]"></div>
          <span className="text-stone-700">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center text-base">
            📖
          </div>
          <span className="text-stone-700">Completed</span>
        </div>
        <div className="ml-auto text-stone-600">
          <span className="font-bold text-[#eab308]">
            {Object.keys(learningRecords).filter(date => {
              const d = new Date(date)
              return d.getMonth() === month && d.getFullYear() === year
            }).length}
          </span>
          {' '}days this month
        </div>
      </div>
    </div>
  )
}
