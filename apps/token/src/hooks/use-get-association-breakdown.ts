import React from 'react';
import type { ethers } from 'ethers';
import * as Sentry from '@sentry/react';
import { addDecimal } from '@vegaprotocol/react-helpers';
import type {
  createStakingBridgeContract,
  createTokenVestingContract,
} from '@vegaprotocol/smart-contracts';

import {
  AppStateActionType,
  useAppState,
} from '../contexts/app-state/app-state-context';
import BigNumber from 'bignumber.js';

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

function combineStakeEventsByVegaKey(
  events: ethers.Event[],
  decimals: number
): { [vegaKey: string]: BigNumber } {
  const res = events.reduce((obj, e) => {
    const vegaKey = e.args?.vega_public_key;
    const amount = parseEventAmount(e, decimals);
    const isDeposit = e.event === 'Stake_Deposited';
    const isRemove = e.event === 'Stake_Removed';

    if (!isDeposit && !isRemove) return obj;

    if (Object.prototype.hasOwnProperty.call(obj, vegaKey)) {
      if (isDeposit) {
        obj[vegaKey] = obj[vegaKey].plus(amount);
      } else {
        obj[vegaKey] = obj[vegaKey].minus(amount);
      }
    } else {
      if (isDeposit) {
        obj[vegaKey] = amount;
      } else {
        obj[vegaKey] = new BigNumber(0);
      }
    }
    return obj;
  }, {} as { [vegaKey: string]: BigNumber });

  return res;
}

function parseEventAmount(e: ethers.Event, decimals: number) {
  const rawAmount = new BigNumber(e.args?.amount.toString() || 0);
  return new BigNumber(addDecimal(rawAmount.toString(), decimals));
}
