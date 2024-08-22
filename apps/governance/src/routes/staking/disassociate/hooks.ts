import { removeDecimal } from '@vegaprotocol/utils';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import React from 'react';

import { useContracts } from '../../../contexts/contracts/contracts-context';
import { TxState } from '../../../hooks/transaction-reducer';
import { useGetAssociationBreakdown } from '../../../hooks/use-get-association-breakdown';
import { useRefreshBalances } from '../../../hooks/use-refresh-balances';
import { useTransaction } from '../../../hooks/use-transaction';

export type RemoveStakePayload = {
  amount: string;
  vegaKey: string;
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

  return walletRemove;
};
