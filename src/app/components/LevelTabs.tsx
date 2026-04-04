'use client'

import { Level, LEVEL_CONFIG, LEVELS } from '../types'

interface LevelTabsProps {
  selectedLevel: Level
  onLevelChange: (level: Level) => void
  className?: string
}

const levelColors = {
  high_school: {
    active: 'bg-emerald-500 text-white border-emerald-500',
    inactive: 'bg-white text-emerald-600 border-emerald-300 hover:bg-emerald-50'
  },
  business: {
    active: 'bg-blue-500 text-white border-blue-500',
    inactive: 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
  },
  advanced: {
    active: 'bg-purple-500 text-white border-purple-500',
    inactive: 'bg-white text-purple-600 border-purple-300 hover:bg-purple-50'
  }
}

export default function LevelTabs({ selectedLevel, onLevelChange, className = '' }: LevelTabsProps) {
  return (
    <div className={`flex justify-center gap-2 ${className}`}>
      {LEVELS.map((level) => {
        const isActive = selectedLevel === level
        const colors = levelColors[level]

        return (
          <button
            key={level}
            onClick={() => onLevelChange(level)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200 ${
              isActive ? colors.active : colors.inactive
            }`}
          >
            {LEVEL_CONFIG[level].label}
          </button>
        )
      })}
    </div>
  )
}
