'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import LevelTabs from './LevelTabs'
import { Level, DEFAULT_LEVEL, LEVELS, isServiceAvailable } from '../types'

// 旧形式から新形式への変換
type OldRecordFormat = string[]
type NewRecordFormat = Record<Level, string[]>
type RecordValue = OldRecordFormat | NewRecordFormat

function isNewFormat(value: RecordValue): value is NewRecordFormat {
  return typeof value === 'object' && !Array.isArray(value)
}

function normalizeRecord(value: RecordValue): NewRecordFormat {
  if (isNewFormat(value)) {
    return {
      high_school: value.high_school || [],
      business: value.business || [],
      advanced: value.advanced || []
    }
  }
  return {
    high_school: value,
    business: [],
    advanced: []
  }
}

interface LearningCalendarProps {
  initialLevel?: Level
}

export default function LearningCalendar({ initialLevel = DEFAULT_LEVEL }: LearningCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [learningRecords, setLearningRecords] = useState<Record<string, NewRecordFormat>>({})
  const [fillInRecords, setFillInRecords] = useState<Record<string, boolean>>({})
  const [selectedLevel, setSelectedLevel] = useState<Level>(initialLevel)

  // LocalStorageから学習記録を読み込み
  const loadRecords = () => {
    if (typeof window === 'undefined') return
    const rawRecords = JSON.parse(localStorage.getItem('learningRecords') || '{}')
    // 全レコードを新形式に変換
    const normalizedRecords: Record<string, NewRecordFormat> = {}
    for (const [date, value] of Object.entries(rawRecords)) {
      normalizedRecords[date] = normalizeRecord(value as RecordValue)
    }
    setLearningRecords(normalizedRecords)
  }

  // LocalStorageから穴埋め完了記録を読み込み
  const loadFillInRecords = () => {
    if (typeof window === 'undefined') return
    const records = JSON.parse(localStorage.getItem('fillInCompleteRecords') || '{}')
    setFillInRecords(records)
  }

  useEffect(() => {
    loadRecords()
    loadFillInRecords()

    // カスタムイベントをリッスンして更新
    const handleUpdate = () => loadRecords()
    const handleFillInUpdate = () => loadFillInRecords()
    window.addEventListener('learningRecordsUpdated', handleUpdate)
    window.addEventListener('fillInRecordsUpdated', handleFillInUpdate)
    return () => {
      window.removeEventListener('learningRecordsUpdated', handleUpdate)
      window.removeEventListener('fillInRecordsUpdated', handleFillInUpdate)
    }
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

  // 日付が学習済みかチェック（選択レベル用）
  const isDayCompleted = (day: number | null) => {
    if (!day) return false
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const record = learningRecords[dateStr]
    if (!record) return false
    return (record[selectedLevel] || []).length > 0
  }

  // 穴埋め全完了かチェック
  const isFillInComplete = (day: number | null) => {
    if (!day) return false
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return fillInRecords[dateStr] === true
  }

  // 今日かどうかチェック
  const isToday = (day: number | null) => {
    if (!day) return false
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  // 日付のURLを生成（レベルパラメータ付き）
  const getDateUrl = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (selectedLevel === DEFAULT_LEVEL) {
      return `/archive/${dateStr}`
    }
    return `/archive/${dateStr}?level=${selectedLevel}`
  }

  // 未来の日付かどうかチェック
  const isFutureDate = (day: number | null) => {
    if (!day) return false
    const checkDate = new Date(year, month, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return checkDate > today
  }

  // サービス開始前の日付かどうかチェック
  const isBeforeServiceStart = (day: number | null) => {
    if (!day) return false
    const checkDate = new Date(year, month, day)
    return !isServiceAvailable(checkDate)
  }

  // 月を変更
  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1))
  }

  // 今月の完了日数を計算（選択レベル用）
  const getCompletedDaysCount = () => {
    let count = 0
    for (const [dateStr, record] of Object.entries(learningRecords)) {
      const d = new Date(dateStr)
      if (d.getFullYear() === year && d.getMonth() === month) {
        if ((record[selectedLevel] || []).length > 0) {
          count++
        }
      }
    }
    return count
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="bg-gradient-to-br from-white to-stone-50 rounded-3xl p-4 md:p-8 shadow-sm border-2 border-stone-200">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 justify-center md:justify-start">
          <CalendarIcon className="hidden md:block w-6 h-6 text-[#ffed4e]" />
          <h3 className="text-xl md:text-2xl font-bold text-[#eab308] font-serif">Learning Calendar</h3>
        </div>
        <div className="flex items-center justify-center gap-1 md:gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1.5 md:p-2 rounded-full hover:bg-amber-100 transition-colors"
            aria-label="前の月"
          >
            <ChevronLeft className="w-5 h-5 text-stone-700" />
          </button>
          <span className="text-base md:text-lg font-semibold text-stone-800 min-w-[120px] md:min-w-[140px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-1.5 md:p-2 rounded-full hover:bg-amber-100 transition-colors"
            aria-label="次の月"
          >
            <ChevronRight className="w-5 h-5 text-stone-700" />
          </button>
        </div>
      </div>

      {/* レベルタブ */}
      <LevelTabs
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        className="mb-6"
      />

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
          const fillInDone = isFillInComplete(day)
          const today = isToday(day)
          const future = isFutureDate(day)
          const beforeService = isBeforeServiceStart(day)
          const isDisabled = future || beforeService

          const cellContent = day && (
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span>{day}</span>
              {(completed || fillInDone) && !beforeService && (
                <span className="text-base leading-none" title={fillInDone ? "学習完了 + 穴埋め全完了" : "学習完了"}>
                  {completed ? '📖' : ''}{fillInDone ? '✨' : ''}
                </span>
              )}
            </div>
          )

          const cellClass = `aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
            day
              ? today
                ? 'bg-[#ffed4e] text-stone-900 font-bold ring-2 ring-[#eab308] shadow-md'
                : completed && !beforeService
                ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-stone-800 shadow-sm'
                : isDisabled
                ? 'bg-white text-stone-300'
                : 'bg-white text-stone-600 hover:bg-amber-50 cursor-pointer'
              : ''
          }`

          // 未来の日付またはサービス開始前の日付はリンクなし
          if (!day || isDisabled) {
            return (
              <div key={index} className={cellClass}>
                {cellContent}
              </div>
            )
          }

          // サービス期間内の日付はリンクあり
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
      <div className="mt-6 pt-6 border-t border-stone-200 flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-[#ffed4e] rounded-lg ring-2 ring-[#eab308]"></div>
          <span className="text-stone-700">Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">📖</span>
          <span className="text-stone-700">Done</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">✨</span>
          <span className="text-stone-700">穴埋め完了</span>
        </div>
        <div className="ml-auto text-stone-600">
          <span className="font-bold text-[#eab308]">
            {getCompletedDaysCount()}
          </span>
          {' '}days
        </div>
      </div>
    </div>
  )
}
