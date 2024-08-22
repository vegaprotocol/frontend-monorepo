import React from 'react';
import type { ethers } from 'ethers';
import * as Sentry from '@sentry/react';
import { addDecimal } from '@vegaprotocol/utils';
import type { StakingBridge } from '@vegaprotocol/smart-contracts';

import { useAppState } from '../contexts/app-state/app-state-context';
import BigNumber from 'bignumber.js';
import { useBalances } from '../lib/balances/balances-store';

export enum StakingEventType {
  Stake_Removed = 'Stake_Removed',
  Stake_Deposited = 'Stake_Deposited',
}

export function useGetAssociationBreakdown(
  ethAddress: string,
  staking: StakingBridge
): () => Promise<void> {
  const {
    appState: { decimals },
  } = useAppState();
  const { setAssociationBreakdown } = useBalances();

  const getAssociationBreakdown = React.useCallback(async () => {
    try {
      const [stakingAssociations] = await Promise.all([
        userTotalStakedByVegaKey(staking, ethAddress, decimals),
      ]);

      setAssociationBreakdown({
        stakingAssociations,
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  }, [ethAddress, staking, decimals, setAssociationBreakdown]);

  return getAssociationBreakdown;
}

async function userTotalStakedByVegaKey(
  contract: StakingBridge,
  ethereumAccount: string,
  decimals: number
): Promise<{ [vegaKey: string]: BigNumber }> {
  const addFilter = contract.contract.filters.StakeDeposited(ethereumAccount);
  const removeFilter = contract.contract.filters.StakeRemoved(ethereumAccount);
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
    const isDeposit = e.event === StakingEventType.Stake_Deposited;
    const isRemove = e.event === StakingEventType.Stake_Removed;

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
