import { useState, useEffect } from 'react';

export const useOfflineListener = () => {
  const [offline, setOffline] = useState<boolean>(false);
  useEffect(() => {
    window.addEventListener('offline', () => {
      setOffline(true);
    });
    window.addEventListener('online', () => {
      setOffline(false);
    });

    return () => {
      window.removeEventListener('offline', () => {
        setOffline(true);
      });
      window.removeEventListener('online', () => {
        setOffline(false);
      });
    };
  }, []);
  return offline;
};
