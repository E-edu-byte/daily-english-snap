export type Level = 'high_school' | 'business' | 'advanced';

// サービス開始日（JST 2026-04-01）
export const SERVICE_START_YEAR = 2026;
export const SERVICE_START_MONTH = 3; // 0-indexed (4月 = 3)
export const SERVICE_START_DAY = 1;

// 日付がサービス開始日以降かどうかチェック（JST基準）
// dateはUTCで年月日を表すDateオブジェクト、またはローカルのDateオブジェクト
export function isServiceAvailable(date: Date): boolean {
  // UTCメソッドを試し、ローカルメソッドにフォールバック
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  // サービス開始日との比較
  if (year > SERVICE_START_YEAR) return true;
  if (year < SERVICE_START_YEAR) return false;
  if (month > SERVICE_START_MONTH) return true;
  if (month < SERVICE_START_MONTH) return false;
  return day >= SERVICE_START_DAY;
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
