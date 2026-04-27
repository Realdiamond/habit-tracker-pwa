import { HABIT_NAME_MAX_LENGTH } from './constants';

/**
 * Validates a habit name input.
 *
 * Rules (Section 9):
 * - Trim incoming value
 * - Reject empty values with: "Habit name is required"
 * - Reject values longer than 60 characters with: "Habit name must be 60 characters or fewer"
 * - When valid, return the normalized trimmed value
 */
export function validateHabitName(name: string): {
  valid: boolean;
  value: string;
  error: string | null;
} {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, value: trimmed, error: 'Habit name is required' };
  }

  if (trimmed.length > HABIT_NAME_MAX_LENGTH) {
    return {
      valid: false,
      value: trimmed,
      error: 'Habit name must be 60 characters or fewer',
    };
  }

  return { valid: true, value: trimmed, error: null };
}
