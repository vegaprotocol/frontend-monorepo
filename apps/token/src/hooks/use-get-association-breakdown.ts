import * as Sentry from "@sentry/react";
import { VegaStaking, VegaVesting } from "@vegaprotocol/smart-contracts-sdk";
import React from "react";

import {
  AppStateActionType,
  useAppState,
} from "../contexts/app-state/app-state-context";

export function useGetAssociationBreakdown(
  ethAddress: string,
  staking: VegaStaking,
  vesting: VegaVesting
): () => Promise<void> {
  const { appDispatch } = useAppState();

  const getAssociationBreakdown = React.useCallback(async () => {
    try {
      const [stakingAssociations, vestingAssociations] = await Promise.all([
        staking.userTotalStakedByVegaKey(ethAddress),
        vesting.userTotalStakedByVegaKey(ethAddress),
      ]);

      appDispatch({
        type: AppStateActionType.SET_ASSOCIATION_BREAKDOWN,
        breakdown: {
          stakingAssociations,
          vestingAssociations,
        },
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  }, [ethAddress, staking, vesting, appDispatch]);

  return getAssociationBreakdown;
}
