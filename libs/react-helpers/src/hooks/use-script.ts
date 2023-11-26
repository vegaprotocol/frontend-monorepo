import { useEffect, useState } from 'react';

const appendScript = (url: string) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.src = url;
    script.async = true;
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`failed to load script: ${url}`));

    document.body.appendChild(script);
  });
};

export const useScript = (url: string) => {
  const [state, setState] = useState<'pending' | 'loaded' | 'error'>('pending');

  useEffect(() => {
    appendScript(url)
      .then(() => {
        setState('loaded');
      })
      .catch((err) => {
        console.error(err);
        setState('error');
      });
  }, [url]);

  return state;
};
