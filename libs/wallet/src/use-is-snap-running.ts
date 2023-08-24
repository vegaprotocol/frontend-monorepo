import { useEffect, useState } from 'react';
import { getSnap } from './connectors';

const INTERVAL = 10_000; // 10 s - same as `useIsWalletServiceRunning`

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
