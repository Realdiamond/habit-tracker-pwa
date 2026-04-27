import { Habit } from '@/types/habit';

/**
 * Toggles a completion date on a habit.
 *
 * Rules (Section 9):
 * - If date does not exist in habit.completions, add it
 * - If date already exists, remove it
 * - The returned habit must not contain duplicate dates
 * - The original input should not be mutated
 */
export function toggleHabitCompletion(habit: Habit, date: string): Habit {
  const hasDate = habit.completions.includes(date);

  const updatedCompletions = hasDate
    ? habit.completions.filter((d) => d !== date)
    : [...habit.completions, date];

  // Ensure no duplicates in the result
  const uniqueCompletions = [...new Set(updatedCompletions)];

  return {
    ...habit,
    completions: uniqueCompletions,
  };
}
