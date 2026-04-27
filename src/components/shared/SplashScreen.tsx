'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import { SPLASH_TARGET_DURATION_MS } from '@/lib/constants';

export default function SplashScreen() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const session = getCurrentSession();
      setVisible(false);
      if (session) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }, SPLASH_TARGET_DURATION_MS);

    return () => clearTimeout(timer);
  }, [router]);

  if (!visible) return null;

  return (
    <div
      data-testid="splash-screen"
      className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50"
    >
      <div className="animate-fade-in flex flex-col items-center gap-6">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse-glow">
          <svg
            className="w-10 h-10 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* App Name */}
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Habit Tracker
        </h1>

        {/* Loading indicator */}
        <div className="flex gap-1.5 mt-4">
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
