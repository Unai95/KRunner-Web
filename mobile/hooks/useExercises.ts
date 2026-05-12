import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { EXAMPLE_EXERCISE, normalizeExercise, normalizeExercises } from '../lib/exercises.js';

export function useExercises() {
  const [exercises, setExercises] = useState<ReturnType<typeof normalizeExercise>[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [storageWarning, setStorageWarning] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.loadExercisesResult().then(({ exercises: saved, warning }) => {
      const normalized = normalizeExercises(saved as unknown[]);
      setExercises(normalized.length ? normalized : normalizeExercises([EXAMPLE_EXERCISE]));
      setStorageWarning(warning);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      api.saveExercises(exercises).catch(() => {});
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [exercises, hydrated]);

  const updateExercise = useCallback((patch: ReturnType<typeof normalizeExercise>) => {
    setExercises((current) => {
      const exists = current.some((ex) => ex.id === patch.id);
      return exists
        ? current.map((ex) => (ex.id === patch.id ? normalizeExercise(patch) : ex))
        : [...current, normalizeExercise(patch)];
    });
  }, []);

  const deleteExercise = useCallback((id: string) => {
    setExercises((current) => current.filter((ex) => ex.id !== id));
  }, []);

  const saveCode = useCallback((id: string, patch: object) => {
    setExercises((current) =>
      current.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex))
    );
  }, []);

  return {
    exercises,
    hydrated,
    storageWarning,
    updateExercise,
    deleteExercise,
    saveCode,
  };
}
