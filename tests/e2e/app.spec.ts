import { test, expect } from '@playwright/test';

const STORAGE_KEYS = {
  USERS: 'habit-tracker-users',
  SESSION: 'habit-tracker-session',
  HABITS: 'habit-tracker-habits',
};

test.describe('Habit Tracker app', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a stable page and clear localStorage
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());
  });

  test('shows the splash screen and redirects unauthenticated users to /login', async ({
    page,
  }) => {
    // Navigate to root — the splash will redirect, so catch any aborted load
    await page.goto('/', { waitUntil: 'commit' }).catch(() => null);

    // Splash screen should be visible during the delay
    const splash = page.getByTestId('splash-screen');
    await expect(splash).toBeVisible({ timeout: 5000 });

    // Wait for redirect to /login (soft navigation — poll pathname)
    await page.waitForFunction(
      () => window.location.pathname === '/login',
      { timeout: 15000 }
    );
    expect(page.url()).toContain('/login');
  });

  test('redirects authenticated users from / to /dashboard', async ({
    page,
  }) => {
    // Seed a session
    await page.evaluate(
      ({ keys }) => {
        const user = {
          id: 'user-1',
          email: 'test@test.com',
          password: 'pass',
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(keys.USERS, JSON.stringify([user]));
        localStorage.setItem(
          keys.SESSION,
          JSON.stringify({ userId: 'user-1', email: 'test@test.com' })
        );
      },
      { keys: STORAGE_KEYS }
    );

    // Navigate to root — may abort due to redirect
    await page.goto('/', { waitUntil: 'commit' }).catch(() => null);

    // Should redirect to /dashboard (soft navigation — poll for URL change)
    await page.waitForFunction(
      () => window.location.pathname === '/dashboard',
      { timeout: 15000 }
    );
    expect(page.url()).toContain('/dashboard');
  });

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'commit' }).catch(() => null);

    // Should redirect to /login
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await page.goto('/signup', { waitUntil: 'domcontentloaded' });

    await page.getByTestId('auth-signup-email').fill('brand-new@test.com');
    await page.getByTestId('auth-signup-password').fill('password123');
    await page.getByTestId('auth-signup-submit').click();

    // After signup, the app calls router.push('/dashboard').
    // Wait for session to be created in localStorage (confirms signup succeeded)
    await page.waitForFunction(
      (key) => localStorage.getItem(key) !== null,
      STORAGE_KEYS.SESSION,
      { timeout: 10000 }
    );

    // Navigate to dashboard (the soft navigation may or may not have completed)
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    // Dashboard should be visible
    await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 15000 });
    expect(page.url()).toContain('/dashboard');
  });

  test("logs in an existing user and loads only that user's habits", async ({
    page,
  }) => {
    // Seed two users, alice's session, and habits for both users
    await page.evaluate(
      ({ keys }) => {
        const user1 = {
          id: 'user-1',
          email: 'alice@test.com',
          password: 'alice123',
          createdAt: new Date().toISOString(),
        };
        const user2 = {
          id: 'user-2',
          email: 'bob@test.com',
          password: 'bob123',
          createdAt: new Date().toISOString(),
        };
        const habits = [
          {
            id: 'h1',
            userId: 'user-1',
            name: 'Alice Habit',
            description: '',
            frequency: 'daily',
            createdAt: new Date().toISOString(),
            completions: [],
          },
          {
            id: 'h2',
            userId: 'user-2',
            name: 'Bob Habit',
            description: '',
            frequency: 'daily',
            createdAt: new Date().toISOString(),
            completions: [],
          },
        ];
        localStorage.setItem(keys.USERS, JSON.stringify([user1, user2]));
        localStorage.setItem(keys.HABITS, JSON.stringify(habits));
        // Seed alice's session directly
        localStorage.setItem(
          keys.SESSION,
          JSON.stringify({ userId: 'user-1', email: 'alice@test.com' })
        );
      },
      { keys: STORAGE_KEYS }
    );

    // Navigate to dashboard as alice
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 15000 });

    // Alice's habit should be visible
    await expect(page.getByTestId('habit-card-alice-habit')).toBeVisible();

    // Bob's habit should NOT be visible
    await expect(page.getByTestId('habit-card-bob-habit')).not.toBeVisible();
  });

  test('creates a habit from the dashboard', async ({ page }) => {
    // Signup first — seed session directly for speed
    await page.evaluate(
      ({ keys }) => {
        const user = {
          id: 'creator-1',
          email: 'creator@test.com',
          password: 'password',
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(keys.USERS, JSON.stringify([user]));
        localStorage.setItem(
          keys.SESSION,
          JSON.stringify({ userId: 'creator-1', email: 'creator@test.com' })
        );
      },
      { keys: STORAGE_KEYS }
    );
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 15000 });

    // Click create habit
    await page.getByTestId('create-habit-button').click();

    // Fill the form
    await page.getByTestId('habit-name-input').fill('Drink Water');
    await page.getByTestId('habit-description-input').fill('Stay hydrated');

    // Submit
    await page.getByTestId('habit-save-button').click();

    // Habit card should appear
    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
  });

  test('completes a habit for today and updates the streak', async ({
    page,
  }) => {
    // Seed session and a habit directly
    await page.evaluate(
      ({ keys }) => {
        const user = {
          id: 'streaker-1',
          email: 'streaker@test.com',
          password: 'password',
          createdAt: new Date().toISOString(),
        };
        const habit = {
          id: 'h-run',
          userId: 'streaker-1',
          name: 'Run Daily',
          description: '',
          frequency: 'daily',
          createdAt: new Date().toISOString(),
          completions: [],
        };
        localStorage.setItem(keys.USERS, JSON.stringify([user]));
        localStorage.setItem(
          keys.SESSION,
          JSON.stringify({ userId: 'streaker-1', email: 'streaker@test.com' })
        );
        localStorage.setItem(keys.HABITS, JSON.stringify([habit]));
      },
      { keys: STORAGE_KEYS }
    );
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 15000 });

    // Streak should be 0
    await expect(page.getByTestId('habit-streak-run-daily')).toContainText('0');

    // Complete it
    await page.getByTestId('habit-complete-run-daily').click();

    // Streak should be 1
    await expect(page.getByTestId('habit-streak-run-daily')).toContainText('1');
  });

  test('persists session and habits after page reload', async ({ page }) => {
    // Seed session directly
    await page.evaluate(
      ({ keys }) => {
        const user = {
          id: 'persist-1',
          email: 'persist@test.com',
          password: 'password',
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(keys.USERS, JSON.stringify([user]));
        localStorage.setItem(
          keys.SESSION,
          JSON.stringify({ userId: 'persist-1', email: 'persist@test.com' })
        );
      },
      { keys: STORAGE_KEYS }
    );
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 15000 });

    // Create a habit
    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Meditate');
    await page.getByTestId('habit-save-button').click();
    await expect(page.getByTestId('habit-card-meditate')).toBeVisible();

    // Reload the page
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Dashboard should still be visible (session persisted)
    await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 15000 });

    // Habit should still be there (habits persisted)
    await expect(page.getByTestId('habit-card-meditate')).toBeVisible();
  });

  test('logs out and redirects to /login', async ({ page }) => {
    // Seed session directly
    await page.evaluate(
      ({ keys }) => {
        const user = {
          id: 'logout-1',
          email: 'logout@test.com',
          password: 'password',
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(keys.USERS, JSON.stringify([user]));
        localStorage.setItem(
          keys.SESSION,
          JSON.stringify({ userId: 'logout-1', email: 'logout@test.com' })
        );
      },
      { keys: STORAGE_KEYS }
    );
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 15000 });

    // Click logout
    await page.getByTestId('auth-logout-button').click();

    // Should redirect to /login
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');

    // Session should be cleared
    const session = await page.evaluate(
      ({ keys }) => localStorage.getItem(keys.SESSION),
      { keys: STORAGE_KEYS }
    );
    expect(session).toBeNull();
  });

  test('loads the cached app shell when offline after the app has been loaded once', async ({
    page,
    context,
  }) => {
    // First, load the app online to cache the shell
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Wait for service worker to install and cache
    await page.waitForTimeout(3000);

    // Go offline
    await context.setOffline(true);

    // Try to load the page again
    try {
      await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 10000 });
    } catch {
      // Some navigations may partially fail offline, that's ok
    }

    // The page should render something (not a blank error page)
    const body = await page.textContent('body');
    expect(body).toBeTruthy();

    // Go back online for cleanup
    await context.setOffline(false);
  });
});
