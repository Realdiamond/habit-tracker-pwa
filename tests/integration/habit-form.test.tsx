import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HabitForm from '@/components/habits/HabitForm';
import HabitList from '@/components/habits/HabitList';
import HabitCard from '@/components/habits/HabitCard';
import { STORAGE_KEYS } from '@/lib/constants';
import { toggleHabitCompletion } from '@/lib/habits';
import { saveHabit, deleteHabitById, getHabits } from '@/lib/storage';
import type { Habit } from '@/types/habit';

function createHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    userId: 'user-1',
    name: 'Drink Water',
    description: 'Stay hydrated',
    frequency: 'daily',
    createdAt: '2025-01-01T00:00:00.000Z',
    completions: [],
    ...overrides,
  };
}

describe('habit form', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows a validation error when habit name is empty', async () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(<HabitForm onSave={onSave} onCancel={onCancel} />);

    // Submit with empty name
    const saveButton = screen.getByTestId('habit-save-button');
    await user.click(saveButton);

    // Validation error should appear
    expect(screen.getByText('Habit name is required')).toBeInTheDocument();

    // onSave should NOT have been called
    expect(onSave).not.toHaveBeenCalled();
  });

  it('creates a new habit and renders it in the list', async () => {
    const habits: Habit[] = [];
    const onSave = vi.fn((data) => {
      const newHabit: Habit = {
        id: 'new-habit-1',
        userId: 'user-1',
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        createdAt: new Date().toISOString(),
        completions: [],
      };
      habits.push(newHabit);
      saveHabit(newHabit);
    });
    const onCancel = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <HabitForm onSave={onSave} onCancel={onCancel} />
    );

    // Fill in habit name
    const nameInput = screen.getByTestId('habit-name-input');
    await user.type(nameInput, 'Drink Water');

    // Submit
    const saveButton = screen.getByTestId('habit-save-button');
    await user.click(saveButton);

    // onSave should have been called with correct data
    expect(onSave).toHaveBeenCalledWith({
      name: 'Drink Water',
      description: '',
      frequency: 'daily',
    });

    // Render the habit list with the created habit
    rerender(
      <HabitList
        habits={habits}
        onToggleComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // Habit card should appear
    expect(screen.getByTestId('habit-card-drink-water')).toBeInTheDocument();

    // Should be persisted in localStorage
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS)!);
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Drink Water');
  });

  it('edits an existing habit and preserves immutable fields', async () => {
    const existingHabit = createHabit({
      completions: ['2025-04-20'],
    });

    const onSave = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <HabitForm
        onSave={onSave}
        onCancel={onCancel}
        editingHabit={existingHabit}
      />
    );

    // Should show form with pre-filled values
    const nameInput = screen.getByTestId('habit-name-input');
    expect(nameInput).toHaveValue('Drink Water');

    // Clear and type new name
    await user.clear(nameInput);
    await user.type(nameInput, 'Drink More Water');

    // Submit
    const saveButton = screen.getByTestId('habit-save-button');
    await user.click(saveButton);

    // onSave should have been called with updated name
    expect(onSave).toHaveBeenCalledWith({
      name: 'Drink More Water',
      description: 'Stay hydrated',
      frequency: 'daily',
    });

    // Simulate the edit in storage (as dashboard would do)
    const updatedHabit: Habit = {
      ...existingHabit,
      name: 'Drink More Water',
    };
    saveHabit(updatedHabit);

    // Verify immutable fields are preserved in storage
    const stored = getHabits();
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Drink More Water');
    expect(stored[0].id).toBe('habit-1');
    expect(stored[0].userId).toBe('user-1');
    expect(stored[0].createdAt).toBe('2025-01-01T00:00:00.000Z');
    expect(stored[0].completions).toEqual(['2025-04-20']);
  });

  it('deletes a habit only after explicit confirmation', async () => {
    const existingHabit = createHabit();
    const onDelete = vi.fn((habitId: string) => {
      deleteHabitById(habitId);
    });
    const user = userEvent.setup();

    // Pre-save habit to localStorage
    saveHabit(existingHabit);

    render(
      <HabitList
        habits={[existingHabit]}
        onToggleComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    // Habit card should be visible
    expect(screen.getByTestId('habit-card-drink-water')).toBeInTheDocument();

    // Click delete button — should show confirmation, not delete yet
    const deleteButton = screen.getByTestId('habit-delete-drink-water');
    await user.click(deleteButton);

    // Habit should still be in the DOM (delete not yet executed)
    expect(screen.getByTestId('habit-card-drink-water')).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();

    // Confirm delete button should be visible
    const confirmButton = screen.getByTestId('confirm-delete-button');
    expect(confirmButton).toBeInTheDocument();

    // Click confirm
    await user.click(confirmButton);

    // onDelete should have been called
    expect(onDelete).toHaveBeenCalledWith('habit-1');

    // localStorage should reflect deletion
    const stored = getHabits();
    expect(stored).toHaveLength(0);
  });

  it('toggles completion and updates the streak display', async () => {
    const existingHabit = createHabit();
    const today = new Date().toISOString().split('T')[0];

    let currentHabit = existingHabit;
    const onToggleComplete = vi.fn((habit: Habit) => {
      currentHabit = toggleHabitCompletion(habit, today);
      saveHabit(currentHabit);
    });

    const { rerender } = render(
      <HabitCard
        habit={currentHabit}
        onToggleComplete={onToggleComplete}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // Streak should be 0 initially
    expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent('0');

    // Click complete button
    const user = userEvent.setup();
    await user.click(screen.getByTestId('habit-complete-drink-water'));

    expect(onToggleComplete).toHaveBeenCalled();

    // Re-render with updated habit
    rerender(
      <HabitCard
        habit={currentHabit}
        onToggleComplete={onToggleComplete}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // Streak should now be 1
    expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent('1');

    // Click again to uncomplete
    await user.click(screen.getByTestId('habit-complete-drink-water'));

    // Re-render with updated habit
    rerender(
      <HabitCard
        habit={currentHabit}
        onToggleComplete={onToggleComplete}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // Streak should go back to 0
    expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent('0');
  });
});
