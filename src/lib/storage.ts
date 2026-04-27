import { User, Session } from '@/types/auth';
import { Habit } from '@/types/habit';
import { STORAGE_KEYS } from './constants';

/**
 * localStorage abstraction layer.
 * All reads/writes to localStorage go through these functions
 * for deterministic persistence behavior (Section 5).
 */

// ─── Users ──────────────────────────────────────────────

export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

export function setUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// ─── Session ────────────────────────────────────────────

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!raw || raw === 'null') return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function setSession(session: Session | null): void {
  if (typeof window === 'undefined') return;
  if (session === null) {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  } else {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  }
}

// ─── Habits ─────────────────────────────────────────────

export function getHabits(): Habit[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Habit[];
  } catch {
    return [];
  }
}

export function setHabits(habits: Habit[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
}

/**
 * Returns only the habits belonging to a specific user.
 */
export function getHabitsByUserId(userId: string): Habit[] {
  return getHabits().filter((h) => h.userId === userId);
}

/**
 * Saves a single habit (add or update) to the habits array.
 */
export function saveHabit(habit: Habit): void {
  const habits = getHabits();
  const index = habits.findIndex((h) => h.id === habit.id);
  if (index >= 0) {
    habits[index] = habit;
  } else {
    habits.push(habit);
  }
  setHabits(habits);
}

/**
 * Deletes a habit by id.
 */
export function deleteHabitById(id: string): void {
  const habits = getHabits().filter((h) => h.id !== id);
  setHabits(habits);
}
