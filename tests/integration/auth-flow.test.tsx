import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { STORAGE_KEYS } from '@/lib/constants';

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
}));

describe('auth flow', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it('submits the signup form and creates a session', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const emailInput = screen.getByTestId('auth-signup-email');
    const passwordInput = screen.getByTestId('auth-signup-password');
    const submitButton = screen.getByTestId('auth-signup-submit');

    await user.type(emailInput, 'new@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Session should be created in localStorage
    const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION)!);
    expect(session).toBeTruthy();
    expect(session.email).toBe('new@example.com');

    // User should be stored in localStorage
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)!);
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe('new@example.com');

    // Should redirect to /dashboard
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error for duplicate signup email', async () => {
    // Pre-seed a user
    localStorage.setItem(
      STORAGE_KEYS.USERS,
      JSON.stringify([
        {
          id: 'existing-id',
          email: 'taken@example.com',
          password: 'pw',
          createdAt: new Date().toISOString(),
        },
      ])
    );

    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByTestId('auth-signup-email'), 'taken@example.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'password123');
    await user.click(screen.getByTestId('auth-signup-submit'));

    // Error message should be shown
    expect(screen.getByText('User already exists')).toBeInTheDocument();

    // Should NOT redirect
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('submits the login form and stores the active session', async () => {
    // Pre-seed a user
    localStorage.setItem(
      STORAGE_KEYS.USERS,
      JSON.stringify([
        {
          id: 'user-1',
          email: 'test@example.com',
          password: 'pass123',
          createdAt: new Date().toISOString(),
        },
      ])
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByTestId('auth-login-email'), 'test@example.com');
    await user.type(screen.getByTestId('auth-login-password'), 'pass123');
    await user.click(screen.getByTestId('auth-login-submit'));

    // Session should be stored
    const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION)!);
    expect(session).toBeTruthy();
    expect(session.userId).toBe('user-1');
    expect(session.email).toBe('test@example.com');

    // Should redirect to /dashboard
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error for invalid login credentials', async () => {
    // Pre-seed a user with known credentials
    localStorage.setItem(
      STORAGE_KEYS.USERS,
      JSON.stringify([
        {
          id: 'user-1',
          email: 'test@example.com',
          password: 'correct-password',
          createdAt: new Date().toISOString(),
        },
      ])
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByTestId('auth-login-email'), 'test@example.com');
    await user.type(screen.getByTestId('auth-login-password'), 'wrong-password');
    await user.click(screen.getByTestId('auth-login-submit'));

    // Error message should be visible
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();

    // Should NOT redirect
    expect(mockPush).not.toHaveBeenCalled();

    // Session should NOT be stored
    expect(localStorage.getItem(STORAGE_KEYS.SESSION)).toBeNull();
  });
});
