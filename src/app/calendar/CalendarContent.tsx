'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import LearningCalendar from '../components/LearningCalendar'
import { Level, DEFAULT_LEVEL, isValidLevel } from '../types'

function CalendarContentInner() {
  const searchParams = useSearchParams()
  const levelParam = searchParams.get('level')
  const initialLevel: Level = isValidLevel(levelParam) ? levelParam : DEFAULT_LEVEL

  return <LearningCalendar initialLevel={initialLevel} />
}

export default function CalendarContent() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <CalendarContentInner />
    </Suspense>
  )
}
