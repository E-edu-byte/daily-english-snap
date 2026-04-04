export type Level = 'high_school' | 'business' | 'advanced';

// サービス開始日（この日付以前はアクセス不可）
export const SERVICE_START_DATE = new Date('2026-04-01T00:00:00');

// 日付がサービス開始日以降かどうかチェック
export function isServiceAvailable(date: Date): boolean {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  const startDate = new Date(SERVICE_START_DATE);
  startDate.setHours(0, 0, 0, 0);
  return checkDate >= startDate;
}

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
