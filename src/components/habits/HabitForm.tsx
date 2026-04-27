'use client';

import { useState, useEffect } from 'react';
import { validateHabitName } from '@/lib/validators';
import type { Habit } from '@/types/habit';

interface HabitFormProps {
  onSave: (data: { name: string; description: string; frequency: 'daily' }) => void;
  onCancel: () => void;
  editingHabit?: Habit | null;
}

export default function HabitForm({ onSave, onCancel, editingHabit }: HabitFormProps) {
  const [name, setName] = useState(editingHabit?.name ?? '');
  const [description, setDescription] = useState(editingHabit?.description ?? '');
  const [frequency, setFrequency] = useState<'daily'>(editingHabit?.frequency ?? 'daily');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setDescription(editingHabit.description);
      setFrequency(editingHabit.frequency);
    }
  }, [editingHabit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateHabitName(name);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    onSave({
      name: validation.value,
      description: description.trim(),
      frequency,
    });

    if (!editingHabit) {
      setName('');
      setDescription('');
    }
  };

  return (
    <form
      data-testid="habit-form"
      onSubmit={handleSubmit}
      className="bg-card rounded-xl p-5 border border-border space-y-4"
    >
      <h2 className="text-lg font-semibold text-foreground">
        {editingHabit ? 'Edit Habit' : 'New Habit'}
      </h2>

      {error && (
        <div className="bg-danger-light border border-danger/30 text-danger rounded-lg px-4 py-2.5 text-sm" role="alert">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="habit-name" className="block text-sm font-medium text-foreground mb-1.5">
          Habit Name <span className="text-danger">*</span>
        </label>
        <input
          id="habit-name"
          data-testid="habit-name-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Drink Water"
          className="w-full px-4 py-2.5 rounded-lg bg-input-bg border border-input-border text-foreground placeholder:text-muted focus:border-input-focus focus:ring-1 focus:ring-input-focus"
        />
      </div>

      <div>
        <label htmlFor="habit-description" className="block text-sm font-medium text-foreground mb-1.5">
          Description
        </label>
        <textarea
          id="habit-description"
          data-testid="habit-description-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description..."
          rows={2}
          className="w-full px-4 py-2.5 rounded-lg bg-input-bg border border-input-border text-foreground placeholder:text-muted focus:border-input-focus focus:ring-1 focus:ring-input-focus resize-none"
        />
      </div>

      <div>
        <label htmlFor="habit-frequency" className="block text-sm font-medium text-foreground mb-1.5">
          Frequency
        </label>
        <select
          id="habit-frequency"
          data-testid="habit-frequency-select"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as 'daily')}
          className="w-full px-4 py-2.5 rounded-lg bg-input-bg border border-input-border text-foreground focus:border-input-focus focus:ring-1 focus:ring-input-focus cursor-pointer"
        >
          <option value="daily">Daily</option>
        </select>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          data-testid="habit-save-button"
          className="flex-1 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover cursor-pointer"
        >
          {editingHabit ? 'Update Habit' : 'Create Habit'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg bg-card-hover text-foreground font-medium hover:bg-border cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
