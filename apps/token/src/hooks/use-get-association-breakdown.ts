import React from 'react';
import * as Sentry from '@sentry/react';
import type {
  createStakingBridgeContract,
  createTokenVestingContract,
} from '@vegaprotocol/smart-contracts';
import { combineStakeEventsByVegaKey } from '@vegaprotocol/smart-contracts';

import {
  AppStateActionType,
  useAppState,
} from '../contexts/app-state/app-state-context';
import type BigNumber from 'bignumber.js';

export function useGetAssociationBreakdown(
  ethAddress: string,
  staking: ReturnType<typeof createStakingBridgeContract>,
  vesting: ReturnType<typeof createTokenVestingContract>
): () => Promise<void> {
  const {
    appState: { decimals },
    appDispatch,
  } = useAppState();

  const getAssociationBreakdown = React.useCallback(async () => {
    try {
      const [stakingAssociations, vestingAssociations] = await Promise.all([
        userTotalStakedByVegaKey(staking, ethAddress, decimals),
        userTotalStakedByVegaKey(vesting, ethAddress, decimals),
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
  }, [ethAddress, staking, vesting, decimals, appDispatch]);

  return getAssociationBreakdown;
}

async function userTotalStakedByVegaKey(
  contract:
    | ReturnType<typeof createStakingBridgeContract>
    | ReturnType<typeof createTokenVestingContract>,
  ethereumAccount: string,
  decimals: number
): Promise<{ [vegaKey: string]: BigNumber }> {
  const addFilter = contract.contract.filters.Stake_Deposited(ethereumAccount);
  const removeFilter = contract.contract.filters.Stake_Removed(ethereumAccount);
  const addEvents = await contract.contract.queryFilter(addFilter);
  const removeEvents = await contract.contract.queryFilter(removeFilter);
  const res = combineStakeEventsByVegaKey(
    [...addEvents, ...removeEvents],
    decimals
  );
  return res;
}
