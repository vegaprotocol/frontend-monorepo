import { useEffect, useState } from 'react';

export const useCopyTimeout = () => {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line
    let timeout: any;

    if (copied) {
      timeout = setTimeout(() => {
        setCopied(false);
      }, 800);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [copied]);

  return [copied, setCopied] as const;
};
