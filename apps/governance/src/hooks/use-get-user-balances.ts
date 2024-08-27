import { useCallback } from 'react';
import * as Sentry from '@sentry/react';
import { toBigNum } from '@vegaprotocol/utils';
import { useContracts } from '../contexts/contracts/contracts-context';
import { useAppState } from '../contexts/app-state/app-state-context';
import { useEthereumConfig } from '@vegaprotocol/web3';

export const useGetUserBalances = (account: string | undefined) => {
  const { token } = useContracts();
  const { config } = useEthereumConfig();
  const {
    appState: { decimals },
  } = useAppState();
  return useCallback(async () => {
    if (!account || !config) return;
    try {
      const [w, a] = await Promise.all([
        token.balanceOf(account),
        token.allowance(account, config.staking_bridge_contract.address),
      ]);

      const walletBalance = toBigNum(w.toString(), decimals);
      const allowance = toBigNum(a.toString(), decimals);

      return {
        walletBalance,
        allowance,
      };
    } catch (err) {
      Sentry.captureException(err);
      return null;
    }
  }, [account, config, decimals, token]);
};
