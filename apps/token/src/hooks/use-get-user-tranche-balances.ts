import React from 'react';
import * as Sentry from '@sentry/react';
import type { TokenVesting } from '@vegaprotocol/smart-contracts';

import { useAppState } from '../contexts/app-state/app-state-context';
import { BigNumber } from '../lib/bignumber';
import { useTranches } from '../lib/tranches/tranches-store';
import { toBigNum } from '@vegaprotocol/react-helpers';

export const useGetUserTrancheBalances = (
  address: string,
  vesting: TokenVesting
) => {
  const {
    appState: { decimals },
  } = useAppState();
  const tranches = useTranches((state) => state.tranches);
  return React.useCallback(async () => {
    try {
      if (!tranches) {
        return;
      }
      const userTranches = tranches?.filter((t) =>
        t.users.some(
          (a) => a && address && a.toLowerCase() === address.toLowerCase()
        )
      );
      const trancheIds = userTranches.map((t) => t.tranche_id);
      const promises = trancheIds.map(async (tId) => {
        const [t, v] = await Promise.all([
          vesting.get_tranche_balance(address, tId),
          vesting.get_vested_for_tranche(address, tId),
        ]);

        const total = toBigNum(t, decimals);
        const vested = toBigNum(v, decimals);

        return {
          id: tId,
          locked: tId === 0 ? total : total.minus(vested),
          vested: tId === 0 ? new BigNumber(0) : vested,
        };
      });

      const trancheBalances = await Promise.all(promises);
      return trancheBalances;
    } catch (e) {
      Sentry.captureException(e);
      return null;
    }
  }, [tranches, address, vesting, decimals]);
};
