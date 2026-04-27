/**
 * Calculates the current streak of consecutive completed days.
 *
 * Rules (Section 9):
 * - completions contains YYYY-MM-DD strings
 * - Remove duplicates before calculating
 * - Sort by date before logic
 * - If today is not completed, current streak is 0
 * - If today is completed, count consecutive calendar days backwards from today
 *
 * Examples:
 *   [] => 0
 *   [today] => 1
 *   [today, yesterday] => 2
 *   [yesterday] => 0
 *   [today, twoDaysAgo] => 1
 */
export function calculateCurrentStreak(
  completions: string[],
  today?: string
): number {
  const todayDate = today ?? new Date().toISOString().split('T')[0];

  // Remove duplicates
  const unique = [...new Set(completions)];

  // Sort descending by date
  unique.sort((a, b) => b.localeCompare(a));

  // If today is not completed, streak is 0
  if (!unique.includes(todayDate)) {
    return 0;
  }

  // Count consecutive days backwards from today
  let streak = 0;

  for (let i = 0; i < unique.length; i++) {
    const expectedDateStr = subtractDays(todayDate, i);

    if (unique.includes(expectedDateStr)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Subtracts N days from a YYYY-MM-DD string, returning a YYYY-MM-DD string.
 * Uses UTC to avoid timezone drift.
 */
function subtractDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - days);
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}
