'use client';

import { useState } from 'react';
import type { Habit } from '@/types/habit';
import { getHabitSlug } from '@/lib/slug';
import { calculateCurrentStreak } from '@/lib/streaks';

interface HabitCardProps {
  habit: Habit;
  onToggleComplete: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export default function HabitCard({
  habit,
  onToggleComplete,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const slug = getHabitSlug(habit.name);
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completions.includes(today);
  const streak = calculateCurrentStreak(habit.completions, today);

  return (
    <div
      data-testid={`habit-card-${slug}`}
      className={`rounded-xl p-4 border transition-all ${
        isCompletedToday
          ? 'bg-success-light border-success/30'
          : 'bg-card border-border hover:border-input-border'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-base truncate ${
            isCompletedToday ? 'text-success' : 'text-foreground'
          }`}>
            {habit.name}
          </h3>
          {habit.description && (
            <p className="text-sm text-muted mt-0.5 line-clamp-2">
              {habit.description}
            </p>
          )}
        </div>

        {/* Streak badge */}
        <div
          data-testid={`habit-streak-${slug}`}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
            streak > 0
              ? 'bg-warning/15 text-warning'
              : 'bg-card-hover text-muted'
          }`}
        >
          <span>🔥</span>
          <span>{streak}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
        {/* Complete toggle */}
        <button
          data-testid={`habit-complete-${slug}`}
          onClick={() => onToggleComplete(habit)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            isCompletedToday
              ? 'bg-success text-white hover:bg-success-hover'
              : 'bg-card-hover text-foreground hover:bg-border'
          }`}
        >
          {isCompletedToday ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Done
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
              </svg>
              Mark
            </>
          )}
        </button>

        <div className="flex-1" />

        {/* Edit */}
        <button
          data-testid={`habit-edit-${slug}`}
          onClick={() => onEdit(habit)}
          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-colors cursor-pointer"
          aria-label={`Edit ${habit.name}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        {/* Delete */}
        {!showDeleteConfirm ? (
          <button
            data-testid={`habit-delete-${slug}`}
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger-light transition-colors cursor-pointer"
            aria-label={`Delete ${habit.name}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              data-testid="confirm-delete-button"
              onClick={() => {
                onDelete(habit.id);
                setShowDeleteConfirm(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-danger text-white text-sm font-medium hover:bg-danger-hover cursor-pointer"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1.5 rounded-lg bg-card-hover text-foreground text-sm font-medium hover:bg-border cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
