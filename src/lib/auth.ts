import { User, Session } from '@/types/auth';
import { STORAGE_KEYS } from './constants';
import { getUsers, getSession, setUsers, setSession } from './storage';

/**
 * Signs up a new user with email and password.
 * - Rejects duplicate emails with "User already exists"
 * - Creates user in localStorage
 * - Creates session in localStorage
 */
export function signup(
  email: string,
  password: string
): { success: boolean; error?: string } {
  const users = getUsers();
  const exists = users.some((u) => u.email === email);

  if (exists) {
    return { success: false, error: 'User already exists' };
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  setUsers([...users, newUser]);
  setSession({ userId: newUser.id, email: newUser.email });

  return { success: true };
}

/**
 * Logs in an existing user with email and password.
 * - Invalid credentials show "Invalid email or password"
 * - On success, creates a session in localStorage
 */
export function login(
  email: string,
  password: string
): { success: boolean; error?: string } {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  setSession({ userId: user.id, email: user.email });

  return { success: true };
}

/**
 * Logs out the current user.
 * - Removes session from localStorage
 */
export function logout(): void {
  setSession(null);
}

/**
 * Returns the current session, or null if not logged in.
 */
export function getCurrentSession(): Session | null {
  return getSession();
}
