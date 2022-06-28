import React from 'react';
import mock from './tranches-mock';
import type { Tranche } from '@vegaprotocol/smart-contracts';

export function useTranches() {
  const [tranches, setTranches] = React.useState<Tranche[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const run = async () => {
      try {
        setTranches(mock);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    run();
  }, []);

  return { tranches, error };
}
