import { useEffect, useState } from 'react';
import type { Provider } from './identity-schema';
import { providersSchema } from './identity-schema';

const cache: {
  [url: string]: Provider[];
} = {};

export const useOracleProofs = (url?: string) => {
  const [data, setData] = useState<Provider[] | undefined>(() =>
    url ? cache[url] : undefined
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState<Error>();

  useEffect(() => {
    let ignore = false;

    if (!url) return;

    const run = async () => {
      try {
        setStatus('loading');
        if (cache[url]) {
          setData(cache[url]);
          setStatus('done');
        } else {
          const res = await fetch(url);
          const json = await res.json();

          if (ignore) return;

          const result = providersSchema.parse(json);

          cache[url] = result;
          setData(result);
          setStatus('done');
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error('Something went wrong'));
        }
      } finally {
        setStatus('done');
      }
    };

    run();

    return () => {
      ignore = true;
    };
  }, [url]);

  return {
    data,
    loading: status === 'loading',
    error,
  };
};
