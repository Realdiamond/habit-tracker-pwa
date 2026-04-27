import { describe, it, expect } from 'vitest';
import { getHabitSlug } from '@/lib/slug';

describe('getHabitSlug', () => {
  it('returns lowercase hyphenated slug for a basic habit name', () => {
    expect(getHabitSlug('Drink Water')).toBe('drink-water');
    expect(getHabitSlug('Read Books')).toBe('read-books');
    expect(getHabitSlug('Exercise')).toBe('exercise');
  });

  it('trims outer spaces and collapses repeated internal spaces', () => {
    expect(getHabitSlug('  Drink Water  ')).toBe('drink-water');
    expect(getHabitSlug('Read    Books')).toBe('read-books');
    expect(getHabitSlug('  Morning   Run  ')).toBe('morning-run');
  });

  it('removes non alphanumeric characters except hyphens', () => {
    expect(getHabitSlug('Hello! World?')).toBe('hello-world');
    expect(getHabitSlug('drink@water#daily')).toBe('drinkwaterdaily');
    expect(getHabitSlug('run (5km)')).toBe('run-5km');
    expect(getHabitSlug('wake-up-early')).toBe('wake-up-early');
  });
});
