import type { ObservableQuery } from '@apollo/client';
import { useEffect } from 'react';

export const useRefreshAfterEpoch = (
  epochExpiry: string | undefined,
  refetch: ObservableQuery['refetch']
) => {
  return useEffect(() => {
    const epochInterval = setInterval(() => {
      if (!epochExpiry) return;
      const now = Date.now();
      const expiry = new Date(epochExpiry).getTime();

      if (now > expiry) {
        refetch();
        clearInterval(epochInterval);
      }
    }, 10000);

    return () => {
      clearInterval(epochInterval);
    };
  }, [refetch, epochExpiry]);
};
