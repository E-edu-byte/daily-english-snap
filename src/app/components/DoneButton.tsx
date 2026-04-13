'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { Level, DEFAULT_LEVEL, LEVELS } from '../types'

interface DoneButtonProps {
  phraseId: string
  date?: string  // YYYY-MM-DD形式。指定しない場合は今日の日付
  level?: Level  // レベル。指定しない場合はhigh_school
}

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
  // 旧形式：high_schoolにマイグレーション
  return {
    high_school: value,
    business: [],
    advanced: []
  }
}

function createEmptyRecord(): NewRecordFormat {
  return {
    high_school: [],
    business: [],
    advanced: []
  }
}

export default function DoneButton({ phraseId, date, level = DEFAULT_LEVEL }: DoneButtonProps) {
  const [isDone, setIsDone] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // 対象の日付を取得（JST基準）
  const getTargetDate = () => {
    if (date) return date
    // JSTで今日の日付を取得
    const now = new Date()
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    return jst.toISOString().split('T')[0]
  }

  // LocalStorageから学習記録を読み込み
  useEffect(() => {
    if (typeof window === 'undefined') return

    const targetDate = getTargetDate()
    const records = JSON.parse(localStorage.getItem('learningRecords') || '{}')
    const dateRecord = records[targetDate]

    if (dateRecord) {
      const normalized = normalizeRecord(dateRecord)
      const levelRecords = normalized[level] || []
      setIsDone(levelRecords.includes(phraseId))
    } else {
      setIsDone(false)
    }
  }, [phraseId, date, level])

  const handleClick = () => {
    if (typeof window === 'undefined') return

    const targetDate = getTargetDate()
    const records = JSON.parse(localStorage.getItem('learningRecords') || '{}')

    // 既存のレコードを新形式に変換
    const dateRecord = records[targetDate]
      ? normalizeRecord(records[targetDate])
      : createEmptyRecord()

    const levelRecords = [...(dateRecord[level] || [])]

    if (isDone) {
      // 学習記録を削除
      const index = levelRecords.indexOf(phraseId)
      if (index > -1) {
        levelRecords.splice(index, 1)
      }
      setIsDone(false)
    } else {
      // 学習記録を追加
      if (!levelRecords.includes(phraseId)) {
        levelRecords.push(phraseId)
      }
      setIsDone(true)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 600)
    }

    dateRecord[level] = levelRecords

    // 空の日付レコードを削除
    const hasAnyRecords = LEVELS.some(l => dateRecord[l].length > 0)
    if (hasAnyRecords) {
      records[targetDate] = dateRecord
    } else {
      delete records[targetDate]
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
        Doneをタップして学習を記録しよう！
      </span>
    </div>
  )
}
