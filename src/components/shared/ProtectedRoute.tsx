'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import type { Session } from '@/types/auth';

interface ProtectedRouteProps {
  children: (session: Session) => React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const currentSession = getCurrentSession();
    if (!currentSession) {
      router.replace('/login');
    } else {
      setSession(currentSession);
      setChecking(false);
    }
  }, [router]);

  if (checking || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return <>{children(session)}</>;
}
