'use client'

import { useState, useEffect, useCallback } from 'react'
import { Level, LEVELS } from '../types'

// 旧形式: { "2024-04-03": ["phrase-id-1"] }
// 新形式: { "2024-04-03": { "high_school": ["phrase-id-1"], "business": [], "advanced": [] } }

type OldRecordFormat = string[]
type NewRecordFormat = Record<Level, string[]>
type RecordValue = OldRecordFormat | NewRecordFormat

interface LearningRecords {
  [date: string]: RecordValue
}

interface NormalizedLearningRecords {
  [date: string]: NewRecordFormat
}

function isNewFormat(value: RecordValue): value is NewRecordFormat {
  return typeof value === 'object' && !Array.isArray(value)
}

function normalizeRecords(records: LearningRecords): NormalizedLearningRecords {
  const normalized: NormalizedLearningRecords = {}

  for (const [date, value] of Object.entries(records)) {
    if (isNewFormat(value)) {
      // 新形式：そのまま使用（ただし全レベルが揃っているか確認）
      normalized[date] = {
        high_school: value.high_school || [],
        business: value.business || [],
        advanced: value.advanced || []
      }
    } else if (Array.isArray(value)) {
      // 旧形式：high_schoolにマイグレーション
      normalized[date] = {
        high_school: value,
        business: [],
        advanced: []
      }
    }
  }

  return normalized
}

function createEmptyRecord(): NewRecordFormat {
  return {
    high_school: [],
    business: [],
    advanced: []
  }
}

export function useLearningRecords() {
  const [records, setRecords] = useState<NormalizedLearningRecords>({})

  const loadRecords = useCallback(() => {
    if (typeof window === 'undefined') return {}
    const raw = JSON.parse(localStorage.getItem('learningRecords') || '{}')
    const normalized = normalizeRecords(raw)
    setRecords(normalized)
    return normalized
  }, [])

  const saveRecords = useCallback((newRecords: NormalizedLearningRecords) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('learningRecords', JSON.stringify(newRecords))
    setRecords(newRecords)
    window.dispatchEvent(new Event('learningRecordsUpdated'))
  }, [])

  const isDone = useCallback((date: string, level: Level, phraseId?: string): boolean => {
    const dateRecords = records[date]
    if (!dateRecords) return false

    const levelRecords = dateRecords[level] || []
    if (phraseId) {
      return levelRecords.includes(phraseId)
    }
    return levelRecords.length > 0
  }, [records])

  const toggleDone = useCallback((date: string, level: Level, phraseId: string): boolean => {
    const currentRecords = { ...records }
    if (!currentRecords[date]) {
      currentRecords[date] = createEmptyRecord()
    }

    const levelRecords = [...(currentRecords[date][level] || [])]
    const index = levelRecords.indexOf(phraseId)
    let newIsDone: boolean

    if (index > -1) {
      // 削除
      levelRecords.splice(index, 1)
      newIsDone = false
    } else {
      // 追加
      levelRecords.push(phraseId)
      newIsDone = true
    }

    currentRecords[date] = {
      ...currentRecords[date],
      [level]: levelRecords
    }

    // 空の日付レコードを削除
    const hasAnyRecords = LEVELS.some(l => currentRecords[date][l].length > 0)
    if (!hasAnyRecords) {
      delete currentRecords[date]
    }

    saveRecords(currentRecords)
    return newIsDone
  }, [records, saveRecords])

  const getCompletedDaysCount = useCallback((year: number, month: number, level?: Level): number => {
    let count = 0
    for (const [date, value] of Object.entries(records)) {
      const d = new Date(date)
      if (d.getFullYear() === year && d.getMonth() === month) {
        if (level) {
          // 特定レベルの完了日数
          if (value[level] && value[level].length > 0) {
            count++
          }
        } else {
          // いずれかのレベルで完了している日数
          if (LEVELS.some(l => value[l] && value[l].length > 0)) {
            count++
          }
        }
      }
    }
    return count
  }, [records])

  useEffect(() => {
    loadRecords()

    const handleUpdate = () => loadRecords()
    window.addEventListener('learningRecordsUpdated', handleUpdate)
    return () => window.removeEventListener('learningRecordsUpdated', handleUpdate)
  }, [loadRecords])

  return {
    records,
    loadRecords,
    isDone,
    toggleDone,
    getCompletedDaysCount
  }
}

// シンプルなヘルパー関数（旧形式互換用）
export function getLearningRecords(): NormalizedLearningRecords {
  if (typeof window === 'undefined') return {}
  const raw = JSON.parse(localStorage.getItem('learningRecords') || '{}')
  return normalizeRecords(raw)
}

export function isDateDone(date: string, level: Level): boolean {
  const records = getLearningRecords()
  const dateRecords = records[date]
  if (!dateRecords) return false
  return (dateRecords[level] || []).length > 0
}
