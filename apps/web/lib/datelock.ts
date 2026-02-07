// Date locking system for Valentine Week experience
// Each day unlocks at midnight starting Feb 7, 2026

// Development mode - only enable in development, NOT in production
const DEV_MODE = process.env.NODE_ENV === 'development';

export const VALENTINE_WEEK_CONFIG = {
  START_DATE: new Date('2026-02-07T00:00:00'),
  END_DATE: new Date('2026-02-15T23:59:59'),
  TIMEZONE: 'Asia/Kolkata',
  DEV_MODE,
} as const;

export interface DateLockStatus {
  isLocked: boolean;
  currentDay: number;
  timeUntilUnlock?: number;
  unlockDate?: Date;
  message: string;
}

export interface DayInfo {
  day: number;
  date: Date;
  name: string;
  theme: string;
  emoji: string;
}

export const DAYS: DayInfo[] = [
  { day: 1, date: new Date('2026-02-07'), name: 'Rose Day', theme: 'rose', emoji: '🌹' },
  { day: 2, date: new Date('2026-02-08'), name: 'Propose Day', theme: 'propose', emoji: '💌' },
  { day: 3, date: new Date('2026-02-09'), name: 'Chocolate Day', theme: 'chocolate', emoji: '🍫' },
  { day: 4, date: new Date('2026-02-10'), name: 'Teddy Day', theme: 'teddy', emoji: '🧸' },
  { day: 5, date: new Date('2026-02-11'), name: 'Promise Day', theme: 'promise', emoji: '💍' },
  { day: 6, date: new Date('2026-02-12'), name: 'Kiss Day', theme: 'kiss', emoji: '💋' },
  { day: 7, date: new Date('2026-02-13'), name: 'Hug Day', theme: 'hug', emoji: '🤗' },
  { day: 8, date: new Date('2026-02-14'), name: "Valentine's Day", theme: 'valentine', emoji: '💝' },
];

export function getCurrentDayInfo(): DayInfo | null {
  const now = new Date();
  const currentDay = DAYS.find(d => {
    const dayStart = new Date(d.date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d.date);
    dayEnd.setHours(23, 59, 59, 999);
    return now >= dayStart && now <= dayEnd;
  });
  return currentDay || null;
}

export function getDateLockStatus(dayNumber: number): DateLockStatus {
  const now = new Date();
  const targetDate = DAYS[dayNumber - 1]?.date;
  
  if (!targetDate) {
    return {
      isLocked: true,
      currentDay: 0,
      message: 'Invalid day',
    };
  }
  
  const targetStart = new Date(targetDate);
  targetStart.setHours(0, 0, 0, 0);
  
  const isLocked = now < targetStart;
  
  let timeUntilUnlock: number | undefined;
  let unlockDate: Date | undefined;
  
  if (isLocked) {
    timeUntilUnlock = targetStart.getTime() - now.getTime();
    unlockDate = targetStart;
  }
  
  // Calculate current day (1-indexed)
  const startDate = new Date(VALENTINE_WEEK_CONFIG.START_DATE);
  startDate.setHours(0, 0, 0, 0);
  
  let currentDay = 0;
  if (now >= startDate) {
    const diffTime = now.getTime() - startDate.getTime();
    currentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  
  // Generate message
  let message: string;
  if (dayNumber <= currentDay) {
    message = 'This day is ready for you';
  } else if (dayNumber === currentDay + 1) {
    message = `Unlocks at midnight (${targetStart.toLocaleDateString('en-IN')})`;
  } else {
    const daysUntil = dayNumber - currentDay;
    message = `Unlocks in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;
  }
  
  return {
    isLocked,
    currentDay: Math.max(0, Math.min(currentDay, 8)),
    timeUntilUnlock,
    unlockDate,
    message,
  };
}

export function isDayUnlocked(dayNumber: number): boolean {
  // Development mode: unlock all days for testing
  if (DEV_MODE) {
    return true;
  }
  return !getDateLockStatus(dayNumber).isLocked;
}

export function getUnlockedDays(): number[] {
  const unlocked: number[] = [];
  for (let i = 1; i <= 8; i++) {
    if (isDayUnlocked(i)) {
      unlocked.push(i);
    }
  }
  return unlocked;
}

export function formatTimeUntilUnlock(ms: number): string {
  if (ms <= 0) return 'Ready!';
  
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  
  return parts.join(' ');
}

export function getThemeColors(theme: string): { primary: string; secondary: string; accent: string } {
  const themes: Record<string, { primary: string; secondary: string; accent: string }> = {
    rose: { primary: '#ff6b9d', secondary: '#fff0f3', accent: '#ffc1e0' },
    propose: { primary: '#ff8c69', secondary: '#faf8f5', accent: '#ffd7be' },
    chocolate: { primary: '#8b4513', secondary: '#3d2817', accent: '#daa520' },
    teddy: { primary: '#ffb4a2', secondary: '#fff5ee', accent: '#ffd7be' },
    promise: { primary: '#d4af37', secondary: '#ffffff', accent: '#f4e7c3' },
    kiss: { primary: '#ff1744', secondary: '#ffc1e0', accent: '#ff6b9d' },
    hug: { primary: '#ff8c69', secondary: '#ffb4a2', accent: '#ffd7be' },
    valentine: { primary: '#ff1744', secondary: '#ff4081', accent: '#f50057' },
  };
  return themes[theme] || themes.rose;
}
