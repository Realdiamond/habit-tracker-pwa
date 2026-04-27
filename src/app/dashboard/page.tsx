'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import HabitForm from '@/components/habits/HabitForm';
import HabitList from '@/components/habits/HabitList';
import { logout } from '@/lib/auth';
import { getHabitsByUserId, saveHabit, deleteHabitById } from '@/lib/storage';
import { toggleHabitCompletion } from '@/lib/habits';
import type { Habit } from '@/types/habit';
import type { Session } from '@/types/auth';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      {(session) => <DashboardContent session={session} />}
    </ProtectedRoute>
  );
}

function DashboardContent({ session }: { session: Session }) {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>(() =>
    getHabitsByUserId(session.userId)
  );
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const refreshHabits = useCallback(() => {
    setHabits(getHabitsByUserId(session.userId));
  }, [session.userId]);

  const handleCreateHabit = (data: {
    name: string;
    description: string;
    frequency: 'daily';
  }) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      userId: session.userId,
      name: data.name,
      description: data.description,
      frequency: data.frequency,
      createdAt: new Date().toISOString(),
      completions: [],
    };

    saveHabit(newHabit);
    refreshHabits();
    setShowForm(false);
  };

  const handleEditHabit = (data: {
    name: string;
    description: string;
    frequency: 'daily';
  }) => {
    if (!editingHabit) return;

    const updatedHabit: Habit = {
      ...editingHabit,
      name: data.name,
      description: data.description,
      frequency: data.frequency,
    };

    saveHabit(updatedHabit);
    refreshHabits();
    setEditingHabit(null);
  };

  const handleDeleteHabit = (habitId: string) => {
    deleteHabitById(habitId);
    refreshHabits();
  };

  const handleToggleComplete = (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = toggleHabitCompletion(habit, today);
    saveHabit(updated);
    refreshHabits();
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isFormOpen = showForm || editingHabit !== null;

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Habit Tracker</h1>
            <p className="text-xs text-muted truncate max-w-[200px]">{session.email}</p>
          </div>
          <button
            data-testid="auth-logout-button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-card-hover transition-colors cursor-pointer"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Create habit button or form */}
        {!isFormOpen ? (
          <button
            data-testid="create-habit-button"
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted hover:border-primary hover:text-primary hover:bg-primary-light font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Habit
          </button>
        ) : (
          <HabitForm
            onSave={editingHabit ? handleEditHabit : handleCreateHabit}
            onCancel={() => {
              setShowForm(false);
              setEditingHabit(null);
            }}
            editingHabit={editingHabit}
          />
        )}

        {/* Habit list */}
        <HabitList
          habits={habits}
          onToggleComplete={handleToggleComplete}
          onEdit={(habit) => {
            setEditingHabit(habit);
            setShowForm(false);
          }}
          onDelete={handleDeleteHabit}
        />
      </main>
    </div>
  );
}
