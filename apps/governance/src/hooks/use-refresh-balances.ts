import * as Sentry from '@sentry/react';
import { toBigNum } from '@vegaprotocol/utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useEthereumConfig } from '@vegaprotocol/web3';
import React from 'react';

import { useAppState } from '../contexts/app-state/app-state-context';
import { useContracts } from '../contexts/contracts/contracts-context';
import { useBalances } from '../lib/balances/balances-store';

export const useRefreshBalances = (address: string) => {
  const {
    appState: { decimals },
  } = useAppState();
  const { updateBalances } = useBalances();
  const { pubKey } = useVegaWallet();
  const { token, staking, vesting } = useContracts();
  const { config } = useEthereumConfig();

  return React.useCallback(async () => {
    if (!config) return;
    try {
      const [b, w, stats, a, walletStakeBalance, vestingStakeBalance] =
        await Promise.all([
          vesting.user_total_all_tranches(address),
          token.balanceOf(address),
          vesting.user_stats(address),
          token.allowance(address, config.staking_bridge_contract.address),
          // Refresh connected vega key balances as well if we are connected to a vega key
          pubKey ? staking.stake_balance(address, pubKey) : null,
          pubKey ? vesting.stake_balance(address, pubKey) : null,
        ]);

      const balance = toBigNum(b.toString(), decimals);
      const walletBalance = toBigNum(w.toString(), decimals);
      const lien = toBigNum(stats.lien.toString(), decimals);
      const allowance = toBigNum(a.toString(), decimals);
      const walletAssociatedBalance = toBigNum(
        walletStakeBalance ? walletStakeBalance.toString() : 0,
        decimals
      );
      const vestingAssociatedBalance = toBigNum(
        vestingStakeBalance ? vestingStakeBalance.toString() : 0,
        decimals
      );

      updateBalances({
        balanceFormatted: balance,
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
    config,
    vesting,
    address,
    token,
    pubKey,
    staking,
    decimals,
    updateBalances,
  ]);
};
