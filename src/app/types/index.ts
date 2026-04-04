export type Level = 'high_school' | 'business' | 'advanced';

export const LEVEL_CONFIG = {
  high_school: { label: '高校英語', color: 'emerald' },
  business: { label: 'ビジネス', color: 'blue' },
  advanced: { label: '上級', color: 'purple' }
} as const;

export const DEFAULT_LEVEL: Level = 'high_school';

export const LEVELS: Level[] = ['high_school', 'business', 'advanced'];

export function isValidLevel(level: string | null | undefined): level is Level {
  return level === 'high_school' || level === 'business' || level === 'advanced';
}
