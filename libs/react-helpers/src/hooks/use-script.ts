import { useEffect, useState } from 'react';

const appendScript = (url: string, integrity: string) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.src = url;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.integrity = integrity;
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`failed to load script: ${url}`));

    document.body.appendChild(script);
  });
};

export const useScript = (url: string, integrity: string) => {
  const [state, setState] = useState<'pending' | 'loaded' | 'error'>('pending');

  useEffect(() => {
    appendScript(url, integrity)
      .then(() => {
        setState('loaded');
      })
      .catch((err) => {
        console.error(err);
        setState('error');
      });
  }, [url, integrity]);

  return state;
};
