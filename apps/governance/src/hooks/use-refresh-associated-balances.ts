import { toBigNum } from '@vegaprotocol/utils';
import React from 'react';

import { useAppState } from '../contexts/app-state/app-state-context';
import { useContracts } from '../contexts/contracts/contracts-context';
import { useBalances } from '../lib/balances/balances-store';

export function useRefreshAssociatedBalances() {
  const {
    appState: { decimals },
  } = useAppState();
  const { updateBalances } = useBalances();
  const { staking, vesting } = useContracts();

  return React.useCallback(
    async (ethAddress: string, vegaKey: string) => {
      const [walletAssociatedBalance, vestingAssociatedBalance] =
        await Promise.all([
          staking.stake_balance(ethAddress, vegaKey),
          vesting.stake_balance(ethAddress, vegaKey),
        ]);

      updateBalances({
        walletAssociatedBalance: toBigNum(walletAssociatedBalance, decimals),
        vestingAssociatedBalance: toBigNum(vestingAssociatedBalance, decimals),
      });
    },
    [staking, vesting, updateBalances, decimals]
  );
}
