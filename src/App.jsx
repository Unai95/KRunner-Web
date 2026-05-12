import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api, AUTO_MAIN_KEY, THEME_KEY } from './lib/api.js';
import {
  DEFAULT_BODY_CODE,
  EXAMPLE_EXERCISE,
  emptyExercise,
  normalizeExercise,
  normalizeExercises,
} from './lib/exercises.js';
import { ExerciseForm } from './pages/ExerciseForm.jsx';
import { Library } from './pages/Library.jsx';
import { Runner } from './pages/Runner.jsx';
import { SettingsView } from './pages/SettingsView.jsx';

export default function App() {
  const [view, setView] = useState('library');
  const [exercises, setExercises] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [storageWarning, setStorageWarning] = useState('');
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage === 'undefined') return 'dark';
    return localStorage.getItem(THEME_KEY) || 'dark';
  });
  const [autoMain, setAutoMain] = useState(() => {
    if (typeof localStorage === 'undefined') return true;
    return localStorage.getItem(AUTO_MAIN_KEY) !== 'false';
  });

  useEffect(() => {
    api.loadExercisesResult()
      .then(({ exercises: saved, warning }) => {
        const normalized = normalizeExercises(saved);
        setExercises(normalized.length ? normalized : normalizeExercises([EXAMPLE_EXERCISE]));
        setStorageWarning(warning);
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) api.saveExercises(exercises).catch(() => {});
  }, [exercises, hydrated]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(AUTO_MAIN_KEY, String(autoMain));
  }, [autoMain]);

  const activeExercise = exercises.find((exercise) => exercise.id === activeId);

  const openNewExercise = () => {
    setEditingExercise(emptyExercise());
    setView('form');
  };

  const openEditExercise = (id) => {
    setEditingExercise(normalizeExercise(exercises.find((exercise) => exercise.id === id)));
    setView('form');
  };

  const saveExercise = (exercise) => {
    setExercises((current) => {
      const exists = current.some((item) => item.id === exercise.id);
      return exists
        ? current.map((item) => item.id === exercise.id ? normalizeExercise(exercise) : item)
        : [...current, normalizeExercise(exercise)];
    });
    setView('library');
  };

  const deleteExercise = (id) => {
    setExercises((current) => current.filter((exercise) => exercise.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setView('library');
    }
  };

  const saveCode = (id, patch) => {
    setExercises((current) => current.map((exercise) => (
      exercise.id === id ? { ...exercise, ...patch } : exercise
    )));
  };

  const resetExercise = (id) => {
    setExercises((current) => current.map((exercise) => (
      exercise.id === id
        ? { ...exercise, code: DEFAULT_BODY_CODE, progress: { passed: 0, total: normalizeExercise(exercise).tests.length, status: 'pending', updatedAt: Date.now() } }
        : exercise
    )));
  };

  if (!hydrated) return <LoadingScreen />;

  return (
    <div className={`app-shell theme-${theme}`}>
      {view === 'library' && (
        <Library
          exercises={exercises}
          storageWarning={storageWarning}
          onCreate={openNewExercise}
          onEdit={openEditExercise}
          onDelete={deleteExercise}
          onReset={resetExercise}
          onSolve={(id) => {
            setActiveId(id);
            setView('runner');
          }}
          onOpenSettings={() => setView('settings')}
        />
      )}
      {view === 'form' && (
        <ExerciseForm
          exercise={editingExercise}
          onCancel={() => setView('library')}
          onSave={saveExercise}
        />
      )}
      {view === 'runner' && activeExercise && (
        <Runner
          exercise={activeExercise}
          theme={theme}
          autoMain={autoMain}
          onBack={() => setView('library')}
          onSaveCode={saveCode}
          onProgress={(patch) => saveCode(activeExercise.id, { progress: patch })}
        />
      )}
      {view === 'settings' && (
        <SettingsView
          theme={theme}
          autoMain={autoMain}
          onTheme={setTheme}
          onAutoMain={setAutoMain}
          onBack={() => setView('library')}
        />
      )}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <Loader2 className="spin" size={18} />
      <span>Cargando ejercicios</span>
    </div>
  );
}
