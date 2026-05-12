import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { DEFAULT_SERVER_URL } from '../lib/storage';

export function useSettings() {
  const [autoMain, setAutoMainState] = useState(true);
  const [serverUrl, setServerUrlState] = useState(DEFAULT_SERVER_URL);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([api.getAutoMain(), api.getServerUrl()]).then(([am, url]) => {
      setAutoMainState(am);
      setServerUrlState(url);
      setLoaded(true);
    });
  }, []);

  const setAutoMain = useCallback(async (value: boolean) => {
    setAutoMainState(value);
    await api.setAutoMain(value);
  }, []);

  const setServerUrl = useCallback(async (url: string) => {
    setServerUrlState(url);
    await api.setServerUrl(url);
  }, []);

  return { autoMain, setAutoMain, serverUrl, setServerUrl, loaded };
}
