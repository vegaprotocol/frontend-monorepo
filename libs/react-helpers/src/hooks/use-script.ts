import { useEffect, useState } from 'react';

const appendScript = (url: string, hash: string) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.id = hash;
    script.src = url;
    script.async = true;
    script.crossOrigin = 'anonymous'; // make sure sri is respected with cross origin request
    script.integrity = `sha256-${hash}`;
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`failed to load script: ${url}`));

    if (!document.getElementById(hash)) {
      document.body.appendChild(script);
    }
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
