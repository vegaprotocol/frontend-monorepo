import * as Sentry from '@sentry/react';
import { toBigNum } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useEthereumConfig } from '@vegaprotocol/web3';
import React from 'react';

import {
  AppStateActionType,
  useAppState,
} from '../contexts/app-state/app-state-context';
import { useContracts } from '../contexts/contracts/contracts-context';

export const useRefreshBalances = (address: string) => {
  const {
    appState: { decimals },
    appDispatch,
  } = useAppState();
  const { keypair } = useVegaWallet();
  const { token, staking, vesting } = useContracts();
  const { config } = useEthereumConfig();

  return React.useCallback(async () => {
    if (!config) return;
    try {
      const [b, w, stats, a, walletStakeBalance, vestingStakeBalance] =
        await Promise.all([
          vesting.userTotalAllTranches(address),
          token.balanceOf(address),
          vesting.userStats(address),
          token.allowance(address, config.staking_bridge_contract.address),
          // Refresh connected vega key balances as well if we are connected to a vega key
          keypair?.pub ? staking.stakeBalance(address, keypair.pub) : null,
          keypair?.pub ? vesting.stakeBalance(address, keypair.pub) : null,
        ]);

      const balance = toBigNum(b, decimals);
      const walletBalance = toBigNum(w, decimals);
      const lien = toBigNum(stats.lien, decimals);
      const allowance = toBigNum(a, decimals);
      const walletAssociatedBalance = toBigNum(walletStakeBalance, decimals);
      const vestingAssociatedBalance = toBigNum(vestingStakeBalance, decimals);

      appDispatch({
        type: AppStateActionType.REFRESH_BALANCES,
        balance,
        walletBalance,
        allowance,
        lien,
        walletAssociatedBalance,
        vestingAssociatedBalance,
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  }, [
    address,
    decimals,
    appDispatch,
    keypair?.pub,
    staking,
    token,
    vesting,
    config,
  ]);
};
