'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'

interface DoneButtonProps {
  phraseId: string
  date?: string  // YYYY-MM-DD形式。指定しない場合は今日の日付
}

export default function DoneButton({ phraseId, date }: DoneButtonProps) {
  const [isDone, setIsDone] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // 対象の日付を取得
  const getTargetDate = () => {
    return date || new Date().toISOString().split('T')[0]
  }

  // LocalStorageから学習記録を読み込み
  useEffect(() => {
    if (typeof window === 'undefined') return

    const targetDate = getTargetDate()
    const records = JSON.parse(localStorage.getItem('learningRecords') || '{}')
    const dateRecords = records[targetDate] || []
    setIsDone(dateRecords.includes(phraseId))
  }, [phraseId, date])

  const handleClick = () => {
    if (typeof window === 'undefined') return

    const targetDate = getTargetDate()
    const records = JSON.parse(localStorage.getItem('learningRecords') || '{}')
    const dateRecords = records[targetDate] || []

    if (isDone) {
      // 学習記録を削除
      const newDateRecords = dateRecords.filter((id: string) => id !== phraseId)
      if (newDateRecords.length === 0) {
        delete records[targetDate]
      } else {
        records[targetDate] = newDateRecords
      }
      setIsDone(false)
    } else {
      // 学習記録を追加
      if (!dateRecords.includes(phraseId)) {
        dateRecords.push(phraseId)
      }
      records[targetDate] = dateRecords
      setIsDone(true)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 600)
    }

    localStorage.setItem('learningRecords', JSON.stringify(records))

    // カスタムイベントを発火してカレンダーを更新
    window.dispatchEvent(new Event('learningRecordsUpdated'))
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        className={`group flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 hover-scale ${
          isDone
            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-md hover:shadow-lg'
            : 'bg-[#fafaf9] text-stone-900 border-2 border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50 shadow-sm'
        } ${isAnimating ? 'animate-pulse' : ''}`}
      >
        {isDone ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>Done!</span>
          </>
        ) : (
          <>
            <Circle className="w-4 h-4" />
            <span>Done</span>
          </>
        )}
      </button>
      <span className="text-sm text-stone-700 font-medium">
        Doneをタップして📅カレンダーをスタンプでいっぱいにしよう！
      </span>
    </div>
  )
}
