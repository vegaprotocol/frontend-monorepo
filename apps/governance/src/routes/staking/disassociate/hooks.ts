import { removeDecimal } from '@vegaprotocol/utils';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import React from 'react';

import { StakingMethod } from '../../../components/staking-method-radio';
import { useContracts } from '../../../contexts/contracts/contracts-context';
import { TxState } from '../../../hooks/transaction-reducer';
import { useGetAssociationBreakdown } from '../../../hooks/use-get-association-breakdown';
import { useRefreshBalances } from '../../../hooks/use-refresh-balances';
import { useTransaction } from '../../../hooks/use-transaction';
import { initialState } from '../../../hooks/transaction-reducer';

export type RemoveStakePayload = {
  amount: string;
  vegaKey: string;
  stakingMethod: StakingMethod;
};

const EMPTY_REMOVE = {
  state: initialState,
  dispatch: () => undefined,
  perform: () => undefined as void,
  reset: () => undefined as void,
};

export const useRemoveStake = (
  address: string,
  payload: RemoveStakePayload
) => {
  const { appState } = useAppState();
  const { staking } = useContracts();
  // Cannot use call on these as they check wallet balance
  // which if staked > wallet balance means you cannot unstaked
  // even worse if you stake everything then you can't unstake anything!

  const walletRemove = useTransaction(() =>
    staking.removeStake(
      removeDecimal(payload.amount, appState.decimals),
      payload.vegaKey
    )
  );

  const refreshBalances = useRefreshBalances(address);
  const getAssociationBreakdown = useGetAssociationBreakdown(address, staking);

  React.useEffect(() => {
    if (walletRemove.state.txState === TxState.Complete) {
      refreshBalances();
      getAssociationBreakdown();
    }
  }, [walletRemove.state.txState, refreshBalances, getAssociationBreakdown]);

  return React.useMemo(() => {
    switch (payload.stakingMethod) {
      case StakingMethod.Wallet:
        return walletRemove;
      default:
        return EMPTY_REMOVE;
    }
  }, [payload, walletRemove]);
};
