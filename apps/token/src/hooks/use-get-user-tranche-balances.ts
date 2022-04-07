import * as Sentry from "@sentry/react";
import { VegaVesting } from "@vegaprotocol/smart-contracts-sdk";
import React from "react";

import {
  AppStateActionType,
  useAppState,
} from "../contexts/app-state/app-state-context";
import { BigNumber } from "../lib/bignumber";

export const useGetUserTrancheBalances = (
  address: string,
  vesting: VegaVesting
) => {
  const { appDispatch } = useAppState();
  return React.useCallback(async () => {
    appDispatch({
      type: AppStateActionType.SET_TRANCHE_ERROR,
      error: null,
    });
    try {
      const tranches = await vesting.getAllTranches();
      const userTranches = tranches.filter((t) =>
        t.users.some(
          ({ address: a }) =>
            a && address && a.toLowerCase() === address.toLowerCase()
        )
      );
      const trancheIds = [0, ...userTranches.map((t) => t.tranche_id)];
      const promises = trancheIds.map(async (tId) => {
        const [total, vested] = await Promise.all([
          vesting.userTrancheTotalBalance(address, tId),
          vesting.userTrancheVestedBalance(address, tId),
        ]);
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
  }, [address, appDispatch, vesting]);
};
