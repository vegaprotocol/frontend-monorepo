import { useCallback } from 'react';
import * as Sentry from '@sentry/react';
import { toBigNum } from '@vegaprotocol/utils';
import { useContracts } from '../contexts/contracts/contracts-context';
import { useAppState } from '../contexts/app-state/app-state-context';
import { useEthereumConfig } from '@vegaprotocol/web3';

export const useGetUserBalances = (account: string | undefined) => {
  const { token, vesting } = useContracts();
  const { config } = useEthereumConfig();
  const {
    appState: { decimals },
  } = useAppState();
  return useCallback(async () => {
    if (!account || !config) return;
    try {
      const [b, w, stats, a] = await Promise.all([
        vesting.user_total_all_tranches(account),
        token.balanceOf(account),
        vesting.user_stats(account),
        token.allowance(account, config.staking_bridge_contract.address),
      ]);

      const balance = toBigNum(b, decimals);
      const walletBalance = toBigNum(w, decimals);
      const lien = toBigNum(stats.lien, decimals);
      const allowance = toBigNum(a, decimals);

      return {
        balanceFormatted: balance,
        walletBalance,
        lien,
        allowance,
        balance,
      };
    } catch (err) {
      Sentry.captureException(err);
      return null;
    }
  }, [account, config, decimals, token, vesting]);
};
