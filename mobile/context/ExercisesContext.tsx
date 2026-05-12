import { createContext, useContext } from 'react';
import type { useExercises } from '../hooks/useExercises';

type ExercisesContextValue = ReturnType<typeof useExercises>;

export const ExercisesContext = createContext<ExercisesContextValue | null>(null);

export function useExercisesContext(): ExercisesContextValue {
  const ctx = useContext(ExercisesContext);
  if (!ctx) throw new Error('useExercisesContext must be used inside ExercisesContext.Provider');
  return ctx;
}
