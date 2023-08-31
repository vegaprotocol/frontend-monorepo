import { useEffect, useState } from 'react';
import { getSnap } from './connectors';

const INTERVAL = 2_000;

export const useIsSnapRunning = (snapId: string, shouldCheck: boolean) => {
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!shouldCheck) return;

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
  }, [snapId, shouldCheck]);
  return running;
};
