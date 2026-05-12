import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY = 'kotlin-runner:exercises';
export const THEME_KEY = 'kotlin-runner:theme';
export const AUTO_MAIN_KEY = 'kotlin-runner:auto-main';
export const SERVER_URL_KEY = 'kotlin-runner:server-url';

export const DEFAULT_SERVER_URL = 'https://krunner-api.up.railway.app';

export async function getItem(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  return AsyncStorage.setItem(key, value);
}
