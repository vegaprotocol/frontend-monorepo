import React from 'react';
import * as Sentry from '@sentry/react';
import type { createTokenVestingContract } from '@vegaprotocol/smart-contracts';

import {
  AppStateActionType,
  useAppState,
} from '../contexts/app-state/app-state-context';
import { BigNumber } from '../lib/bignumber';
import { useTranches } from './use-tranches';
import { toBigNum } from '@vegaprotocol/react-helpers';

export const useGetUserTrancheBalances = (
  address: string,
  vesting: ReturnType<typeof createTokenVestingContract>
) => {
  const {
    appState: { decimals },
    appDispatch,
  } = useAppState();
  const { tranches } = useTranches();
  return React.useCallback(async () => {
    appDispatch({
      type: AppStateActionType.SET_TRANCHE_ERROR,
      error: null,
    });
    try {
      if (!tranches) {
        return;
      }
      const userTranches = tranches?.filter((t) =>
        t.users.some(
          ({ address: a }) =>
            a && address && a.toLowerCase() === address.toLowerCase()
        )
      );
      const trancheIds = [0, ...userTranches.map((t) => t.tranche_id)];
      const promises = trancheIds.map(async (tId) => {
        const [t, v] = await Promise.all([
          vesting.getTrancheBalance(address, tId),
          vesting.getVestedForTranche(address, tId),
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
      appDispatch({
        type: AppStateActionType.SET_TRANCHE_DATA,
        trancheBalances,
        tranches,
      });
    } catch (e) {
      Sentry.captureException(e);
      appDispatch({
        type: AppStateActionType.SET_TRANCHE_ERROR,
        error: e as Error,
      });
    }
  }, [address, decimals, appDispatch, tranches, vesting]);
};
