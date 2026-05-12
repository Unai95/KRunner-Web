import { normalizeExercises } from './exercises.js';
import {
  AUTO_MAIN_KEY,
  DEFAULT_SERVER_URL,
  SERVER_URL_KEY,
  STORAGE_KEY,
  THEME_KEY,
  getItem,
  setItem,
} from './storage';

export { AUTO_MAIN_KEY, THEME_KEY };

export const api = {
  async loadExercisesResult(): Promise<{ exercises: unknown[] | null; warning: string }> {
    try {
      const raw = await getItem(STORAGE_KEY);
      if (!raw) return { exercises: null, warning: '' };
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return { exercises: null, warning: 'Los datos guardados no tienen formato valido.' };
      }
      return { exercises: parsed, warning: '' };
    } catch (error) {
      return { exercises: null, warning: `Error al cargar ejercicios: ${String(error)}` };
    }
  },

  async saveExercises(exercises: unknown[]): Promise<boolean> {
    await setItem(STORAGE_KEY, JSON.stringify(exercises));
    return true;
  },

  async executeLocal(payload: { code: string; stdin: string; timeoutMs: number }): Promise<unknown> {
    return this.executeRemote(payload);
  },

  async executeRemote(payload: { code: string; stdin: string; timeoutMs: number }): Promise<unknown> {
    const serverUrl = (await getItem(SERVER_URL_KEY)) ?? DEFAULT_SERVER_URL;
    const url = serverUrl.replace(/\/$/, '');

    let response: Response;
    try {
      response = await fetch(`${url}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(payload.timeoutMs + 15000),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('timeout') || message.includes('abort')) {
        throw new Error('LIMIT: La peticion al servidor expiro. Comprueba tu conexion.');
      }
      throw new Error(`ENVIRONMENT: No se pudo conectar con el servidor: ${message}`);
    }

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try {
        const body = await response.json();
        if (body.error) errorMsg = body.error;
      } catch {}
      throw new Error(errorMsg);
    }

    return response.json();
  },

  async getTheme(): Promise<string> {
    return (await getItem(THEME_KEY)) ?? 'dark';
  },

  async setTheme(theme: string): Promise<void> {
    return setItem(THEME_KEY, theme);
  },

  async getAutoMain(): Promise<boolean> {
    const val = await getItem(AUTO_MAIN_KEY);
    return val !== 'false';
  },

  async setAutoMain(value: boolean): Promise<void> {
    return setItem(AUTO_MAIN_KEY, String(value));
  },

  async getServerUrl(): Promise<string> {
    return (await getItem(SERVER_URL_KEY)) ?? DEFAULT_SERVER_URL;
  },

  async setServerUrl(url: string): Promise<void> {
    return setItem(SERVER_URL_KEY, url.trim());
  },
};
