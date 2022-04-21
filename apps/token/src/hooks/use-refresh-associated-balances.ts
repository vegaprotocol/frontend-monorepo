import React from "react";

import {
  AppStateActionType,
  useAppState,
} from "../contexts/app-state/app-state-context";
import { useContracts } from "../contexts/contracts/contracts-context";

export function useRefreshAssociatedBalances() {
  const { appDispatch } = useAppState();
  const { staking, vesting } = useContracts();

  const refresh = React.useCallback(
    async (ethAddress: string, vegaKey: string) => {
      const [walletAssociatedBalance, vestingAssociatedBalance] =
        await Promise.all([
          staking.stakeBalance(ethAddress, vegaKey),
          vesting.stakeBalance(ethAddress, vegaKey),
        ]);

      appDispatch({
        type: AppStateActionType.REFRESH_ASSOCIATED_BALANCES,
        walletAssociatedBalance,
        vestingAssociatedBalance,
      });
    },
    [staking, vesting, appDispatch]
  );

  return refresh;
}
