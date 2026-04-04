'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Level, DEFAULT_LEVEL, isValidLevel } from '../types'

export function useLevel() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const levelParam = searchParams.get('level')
  const level: Level = isValidLevel(levelParam) ? levelParam : DEFAULT_LEVEL

  const setLevel = useCallback((newLevel: Level) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newLevel === DEFAULT_LEVEL) {
      params.delete('level')
    } else {
      params.set('level', newLevel)
    }
    const queryString = params.toString()
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false })
  }, [searchParams, router, pathname])

  return { level, setLevel }
}

export function getLevelFromSearchParams(searchParams: URLSearchParams): Level {
  const levelParam = searchParams.get('level')
  return isValidLevel(levelParam) ? levelParam : DEFAULT_LEVEL
}
