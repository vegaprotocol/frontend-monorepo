import { useEffect, useState } from 'react';
import { getSnap } from './connectors';

const INTERVAL = 2_000;

export enum SnapStatus {
  NOT_SUPPORTED,
  INSTALLED,
  NOT_INSTALLED,
}

export const useSnapStatus = (snapId: string, shouldCheck: boolean) => {
  const [status, setStatus] = useState<SnapStatus>(SnapStatus.NOT_INSTALLED);
  useEffect(() => {
    if (!shouldCheck) return;

    const checkState = async () => {
      try {
        const snap = await getSnap(snapId);
        setStatus(snap ? SnapStatus.INSTALLED : SnapStatus.NOT_INSTALLED);
      } catch (err) {
        setStatus(SnapStatus.NOT_SUPPORTED);
      }
    };

    const i = setInterval(() => {
      checkState();
    }, INTERVAL);

    checkState();

    return () => {
      clearInterval(i);
    };
  }, [snapId, shouldCheck]);
  return status;
};
