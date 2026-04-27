import { describe, it, expect } from 'vitest';
import { toggleHabitCompletion } from '@/lib/habits';
import type { Habit } from '@/types/habit';

function createHabit(completions: string[] = []): Habit {
  return {
    id: 'test-id',
    userId: 'test-user',
    name: 'Test Habit',
    description: 'Test description',
    frequency: 'daily',
    createdAt: '2025-01-01T00:00:00.000Z',
    completions,
  };
}

describe('toggleHabitCompletion', () => {
  it('adds a completion date when the date is not present', () => {
    const habit = createHabit([]);
    const result = toggleHabitCompletion(habit, '2025-04-25');
    expect(result.completions).toContain('2025-04-25');
    expect(result.completions).toHaveLength(1);
  });

  it('removes a completion date when the date already exists', () => {
    const habit = createHabit(['2025-04-25']);
    const result = toggleHabitCompletion(habit, '2025-04-25');
    expect(result.completions).not.toContain('2025-04-25');
    expect(result.completions).toHaveLength(0);
  });

  it('does not mutate the original habit object', () => {
    const habit = createHabit(['2025-04-25']);
    const original = { ...habit, completions: [...habit.completions] };
    toggleHabitCompletion(habit, '2025-04-26');

    expect(habit.completions).toEqual(original.completions);
    expect(habit.id).toBe(original.id);
    expect(habit.name).toBe(original.name);
  });

  it('does not return duplicate completion dates', () => {
    const habit = createHabit(['2025-04-25', '2025-04-25']);
    const result = toggleHabitCompletion(habit, '2025-04-26');

    const uniqueDates = [...new Set(result.completions)];
    expect(result.completions).toEqual(uniqueDates);
  });
});
