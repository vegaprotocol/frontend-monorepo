import { useCallback } from 'react';

// this should be replaced by implementation of busEvents listener when it will be available
export const usePositionEvent = () => {
  const waitForOrderEvent = useCallback(
    (id: string, partyId: string, callback: () => void) => {
      Promise.resolve().then(() => {
        callback();
      });
    },
    []
  );
  return waitForOrderEvent;
};
