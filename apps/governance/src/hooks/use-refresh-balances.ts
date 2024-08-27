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
  const { token, staking } = useContracts();
  const { config } = useEthereumConfig();

  return React.useCallback(async () => {
    if (!config) return;
    try {
      const [w, a, walletStakeBalance] = await Promise.all([
        token.balanceOf(address),
        token.allowance(address, config.staking_bridge_contract.address),
        // Refresh connected vega key balances as well if we are connected to a vega key
        pubKey ? staking.stake_balance(address, pubKey) : null,
      ]);

      const walletBalance = toBigNum(w.toString(), decimals);
      const allowance = toBigNum(a.toString(), decimals);
      const walletAssociatedBalance = toBigNum(
        walletStakeBalance ? walletStakeBalance.toString() : 0,
        decimals
      );

      updateBalances({
        walletBalance,
        allowance,
        walletAssociatedBalance,
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  }, [config, address, token, pubKey, staking, decimals, updateBalances]);
};
