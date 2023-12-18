import { useEffect, useState } from 'react';
import { type VegaConnector } from '.';

/**
 * Determines the interval for checking if wallet connection is alive.
 */
export const DEFAULT_KEEP_ALIVE = 1000;

export const useIsAlive = (
  connector: VegaConnector | null,
  interval: number
) => {
  const [alive, setAlive] = useState<boolean | null>(null);

  useEffect(() => {
    if (!connector) {
      return;
    }

    const i = setInterval(() => {
      connector.isAlive().then((isAlive) => {
        if (alive !== isAlive) setAlive(isAlive);
      });
    }, interval);
    return () => {
      clearInterval(i);
    };
  }, [alive, connector, interval]);

  return alive;
};
