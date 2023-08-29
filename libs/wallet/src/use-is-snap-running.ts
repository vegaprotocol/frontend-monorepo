import { useEffect, useState } from 'react';
import { getSnap } from './connectors';

const INTERVAL = 2_000;

export const useIsSnapRunning = (snapId: string) => {
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const checkState = async () => {
      const snap = await getSnap(snapId);
      setRunning(!!snap);
    };
    const i = setInterval(() => {
      checkState();
    }, INTERVAL);
    checkState();
    return () => {
      clearInterval(i);
    };
  }, [snapId]);
  return running;
};
