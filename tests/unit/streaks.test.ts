import { describe, it, expect } from 'vitest';
import { calculateCurrentStreak } from '@/lib/streaks';

/**
 * Helper: Returns a date string N days before `today`.
 */
function daysAgo(n: number, today: string): string {
  const [y, m, d] = today.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - n);
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/* MENTOR_TRACE_STAGE3_HABIT_A91 */
describe('calculateCurrentStreak', () => {
  const today = '2025-04-25';

  it('returns 0 when completions is empty', () => {
    expect(calculateCurrentStreak([], today)).toBe(0);
  });

  it('returns 0 when today is not completed', () => {
    const yesterday = daysAgo(1, today);
    expect(calculateCurrentStreak([yesterday], today)).toBe(0);
  });

  it('returns the correct streak for consecutive completed days', () => {
    const completions = [
      today,
      daysAgo(1, today),
      daysAgo(2, today),
    ];
    expect(calculateCurrentStreak(completions, today)).toBe(3);

    // Just today
    expect(calculateCurrentStreak([today], today)).toBe(1);

    // Today and yesterday
    expect(calculateCurrentStreak([today, daysAgo(1, today)], today)).toBe(2);
  });

  it('ignores duplicate completion dates', () => {
    const completions = [today, today, daysAgo(1, today), daysAgo(1, today)];
    expect(calculateCurrentStreak(completions, today)).toBe(2);
  });

  it('breaks the streak when a calendar day is missing', () => {
    // Today and two days ago — yesterday is missing, so streak = 1
    const completions = [today, daysAgo(2, today)];
    expect(calculateCurrentStreak(completions, today)).toBe(1);
  });
});
