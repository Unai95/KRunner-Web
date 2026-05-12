export const STORAGE_KEY = 'kotlin-runner:browser-fallback';
export const THEME_KEY = 'kotlin-runner:theme';
export const AUTO_MAIN_KEY = 'kotlin-runner:auto-main';

const API_BASE = import.meta.env.VITE_KRUNNER_API_URL || (import.meta.env.DEV ? '/api' : '');

export const api = {
  async loadExercisesResult() {
    try {
      const saved = await this.loadExercises();
      if (!Array.isArray(saved)) {
        return { exercises: null, warning: saved ? 'El archivo de ejercicios no tiene un formato valido.' : '' };
      }
      return { exercises: saved, warning: '' };
    } catch (error) {
      return {
        exercises: null,
        warning: `No se pudieron leer los ejercicios guardados: ${error.message || String(error)}`,
      };
    }
  },
  async loadExercises() {
    if (window.kotlinRunner) {
      const raw = await window.kotlinRunner.loadExercises();
      return raw ? JSON.parse(raw) : null;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  async saveExercises(exercises) {
    const raw = JSON.stringify(exercises, null, 2);
    if (window.kotlinRunner) return window.kotlinRunner.saveExercises(raw);
    localStorage.setItem(STORAGE_KEY, raw);
    return true;
  },
  async executeLocal(payload) {
    if (window.kotlinRunner) return window.kotlinRunner.executeLocal(payload);

    const response = await fetch(`${API_BASE}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `El servidor respondio con estado ${response.status}.`);
    }
    return data;
  },
};
