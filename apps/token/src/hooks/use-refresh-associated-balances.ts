import { toBigNum } from '@vegaprotocol/react-helpers';
import React from 'react';

import {
  AppStateActionType,
  useAppState,
} from '../contexts/app-state/app-state-context';
import { useContracts } from '../contexts/contracts/contracts-context';

export function useRefreshAssociatedBalances() {
  const {
    appDispatch,
    appState: { decimals },
  } = useAppState();
  const { staking, vesting } = useContracts();

  return React.useCallback(
    async (ethAddress: string, vegaKey: string) => {
      const [walletAssociatedBalance, vestingAssociatedBalance] =
        await Promise.all([
          staking.stake_balance(ethAddress, vegaKey),
          vesting.stake_balance(ethAddress, vegaKey),
        ]);

      appDispatch({
        type: AppStateActionType.REFRESH_ASSOCIATED_BALANCES,
        walletAssociatedBalance: toBigNum(walletAssociatedBalance, decimals),
        vestingAssociatedBalance: toBigNum(vestingAssociatedBalance, decimals),
      });
    },
    [staking, vesting, appDispatch, decimals]
  );
}
