// localStorage keys as defined in the Persistence Contract (Section 5)
export const STORAGE_KEYS = {
  USERS: 'habit-tracker-users',
  SESSION: 'habit-tracker-session',
  HABITS: 'habit-tracker-habits',
} as const;

// Validation constants
export const HABIT_NAME_MAX_LENGTH = 60;

// Splash screen duration range (Section 4)
export const SPLASH_MIN_DURATION_MS = 800;
export const SPLASH_MAX_DURATION_MS = 2000;
export const SPLASH_TARGET_DURATION_MS = 1500;
