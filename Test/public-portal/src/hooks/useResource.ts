import { useCallback, useEffect, useEffectEvent, useState } from 'react';
import { getErrorMessage } from '@/api/http';

interface Result<T> {
  key: string;
  data?: T;
  error?: string;
}

/**
 * Minimal data hook with loading / error / reload.
 * `key` identifies the request; changing it triggers a refetch. State is only set from async callbacks.
 */
export function useResource<T>(fetcher: () => Promise<T>, key: string) {
  const [result, setResult] = useState<Result<T>>({ key: '' });
  const [nonce, setNonce] = useState(0);
  const requestKey = `${key}#${nonce}`;
  const run = useEffectEvent(() => fetcher());

  useEffect(() => {
    let active = true;
    run()
      .then((data) => active && setResult({ key: requestKey, data }))
      .catch((e: unknown) => active && setResult({ key: requestKey, error: getErrorMessage(e) }));
    return () => {
      active = false;
    };
  }, [requestKey]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const loading = result.key !== requestKey;
  return {
    data: loading ? undefined : result.data,
    error: loading ? undefined : result.error,
    loading,
    reload,
  };
}
