import BigNumber from 'bignumber.js';
import type { ethers } from 'ethers';
import uniq from 'lodash/uniq';
import { addDecimal } from '../utils/decimals';

import type { Tranche, TrancheUser } from './vega-web3-types';
import { TrancheEvents } from './vega-web3-types';

export function createUserTransactions(
  events: ethers.Event[],
  decimals: number
) {
  return events.map((event) => {
    return {
      amount: addDecimal(
        new BigNumber(event.args?.amount.toString()),
        decimals
      ),
      user: event.args?.user,
      tranche_id: event.args?.tranche_id,
      tx: event.transactionHash,
    };
  });
}

export function getUsersInTranche(
  balanceAddedEvents: ethers.Event[],
  balanceRemovedEvents: ethers.Event[],
  addresses: string[],
  decimals: number
): TrancheUser[] {
  return addresses.map((address) => {
    const userDeposits = balanceAddedEvents.filter(
      (event) => event.args?.user === address
    );
    const userWithdraws = balanceRemovedEvents.filter(
      (event) => event.args?.user === address
    );
    const deposits = createUserTransactions(userDeposits, decimals);
    const withdrawals = createUserTransactions(userWithdraws, decimals);
    const total_tokens = deposits.reduce(
      (pre, cur) => pre.plus(cur.amount),
      new BigNumber(0)
    );
    const withdrawn_tokens = withdrawals.reduce(
      (pre, cur) => pre.plus(cur.amount),
      new BigNumber(0)
    );
    const remaining_tokens = total_tokens.minus(withdrawn_tokens);

    return {
      address,
      deposits,
      withdrawals,
      total_tokens,
      withdrawn_tokens,
      remaining_tokens,
    };
  });
}

export function sumFromEvents(events: ethers.Event[], decimals: number) {
  const amounts = events.map((e) =>
    addDecimal(new BigNumber(e.args?.amount.toString()), decimals)
  );
  // Start with a 0 so if there are none there is no NaN
  return BigNumber.sum.apply(null, [new BigNumber(0), ...amounts]);
}

export function getLockedAmount(
  totalAdded: BigNumber,
  cliffStart: number,
  trancheDuration: number
) {
  let amount = new BigNumber(0);
  const ts = Math.round(new Date().getTime() / 1000);
  const tranche_progress = (ts - cliffStart) / trancheDuration;

  if (tranche_progress < 0) {
    amount = totalAdded;
  } else if (tranche_progress < 1) {
    amount = totalAdded.times(1 - tranche_progress);
  }

  return amount;
}

export function createTransactions(events: ethers.Event[], decimals: number) {
  return events.map((event) => {
    return {
      amount: addDecimal(
        new BigNumber(event.args?.amount.toString()),
        decimals
      ),
      user: event.args?.user,
      tx: event.transactionHash,
    };
  });
}

export function getTranchesFromHistory(
  createEvents: ethers.Event[],
  addEvents: ethers.Event[],
  removeEvents: ethers.Event[],
  decimals: number
): Tranche[] {
  return createEvents.map((event) => {
    const tranche_id = event.args?.tranche_id;
    const balanceAddedEvents = addEvents.filter(
      (e) =>
        e.event === TrancheEvents.BalanceAdded &&
        e.args?.tranche_id === tranche_id
    );
    const balanceRemovedEvents = removeEvents.filter(
      (e) =>
        e.event === TrancheEvents.BalanceRemoved &&
        e.args?.tranche_id === tranche_id
    );

    //get tranche start and end dates
    const tranche_duration = event.args?.duration;
    const cliff_start = event.args?.cliff_start;
    const tranche_start = new Date(cliff_start.mul(1000).toNumber());
    const tranche_end = new Date(
      cliff_start.add(tranche_duration).mul(1000).toNumber()
    );

    // get added and removed values
    const total_added = sumFromEvents(balanceAddedEvents, decimals);
    const total_removed = sumFromEvents(balanceRemovedEvents, decimals);
    // get locked amount
    const locked_amount = getLockedAmount(
      total_added,
      cliff_start,
      tranche_duration
    );

    // get all deposits and withdrawals
    const deposits = createTransactions(balanceAddedEvents, decimals);
    const withdrawals = createTransactions(balanceRemovedEvents, decimals);

    // get all users
    const uniqueAddresses = uniq(
      balanceAddedEvents.map((event) => event.args?.user)
    );
    const users = getUsersInTranche(
      balanceAddedEvents,
      balanceRemovedEvents,
      uniqueAddresses,
      decimals
    );

    return {
      tranche_id: parseInt(tranche_id),
      tranche_start,
      tranche_end,
      total_added,
      total_removed,
      locked_amount,
      deposits,
      withdrawals,
      users,
    };
  });
}
