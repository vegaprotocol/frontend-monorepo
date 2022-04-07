import BigNumber from "bignumber.js";
import React from "react";

import { StakingMethod } from "../../../components/staking-method-radio";
import { useContracts } from "../../../contexts/contracts/contracts-context";
import { TxState } from "../../../hooks/transaction-reducer";
import { useGetAssociationBreakdown } from "../../../hooks/use-get-association-breakdown";
import { useRefreshBalances } from "../../../hooks/use-refresh-balances";
import { useTransaction } from "../../../hooks/use-transaction";

export const useRemoveStake = (
  address: string,
  amount: string,
  vegaKey: string,
  stakingMethod: StakingMethod | ""
) => {
  const { staking, vesting } = useContracts();
  // Cannot use call on these as they check wallet balance
  // which if staked > wallet balance means you cannot unstaked
  // even worse if you stake everything then you can't unstake anything!
  const contractRemove = useTransaction(() =>
    vesting.removeStake(new BigNumber(amount), vegaKey)
  );
  const walletRemove = useTransaction(() =>
    staking.removeStake(new BigNumber(amount), vegaKey)
  );
  const refreshBalances = useRefreshBalances(address);
  const getAssociationBreakdown = useGetAssociationBreakdown(
    address,
    staking,
    vesting
  );

  React.useEffect(() => {
    if (
      walletRemove.state.txState === TxState.Complete ||
      contractRemove.state.txState === TxState.Complete
    ) {
      refreshBalances();
      getAssociationBreakdown();
    }
  }, [
    contractRemove.state.txState,
    walletRemove.state.txState,
    refreshBalances,
    getAssociationBreakdown,
  ]);

  return React.useMemo(() => {
    if (stakingMethod === StakingMethod.Contract) {
      return contractRemove;
    } else {
      return walletRemove;
    }
  }, [contractRemove, stakingMethod, walletRemove]);
};
