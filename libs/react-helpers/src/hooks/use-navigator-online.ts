import { useEffect, useState } from 'react';

export const useNavigatorOnline = () => {
  const [online, setOnline] = useState(window.navigator.onLine);

  useEffect(() => {
    function handleOnline(event: Event) {
      setOnline(true);
    }

    function handleOffline(event: Event) {
      setOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
};
