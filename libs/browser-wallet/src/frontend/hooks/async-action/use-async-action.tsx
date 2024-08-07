import { useCallback, useState } from 'react';

export function useAsyncAction<T = void, S = void>(
  function_: (arguments_: S) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const loaderFunction = useCallback(
    async (arguments_: S) => {
      try {
        setLoading(true);
        const result = await function_(arguments_);
        setData(result);
      } catch (error_) {
        setError(error_ as Error);
      } finally {
        setLoading(false);
      }
    },
    [function_]
  );
  return {
    loading,
    error,
    data,
    loaderFunction,
  };
}
