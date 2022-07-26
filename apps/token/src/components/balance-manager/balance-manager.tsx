import * as Sentry from '@sentry/react';
import { toBigNum } from '@vegaprotocol/react-helpers';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import React from 'react';

import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { useContracts } from '../../contexts/contracts/contracts-context';
import { useGetAssociationBreakdown } from '../../hooks/use-get-association-breakdown';
import { useGetUserTrancheBalances } from '../../hooks/use-get-user-tranche-balances';

interface BalanceManagerProps {
  children: React.ReactElement;
}

export const BalanceManager = ({ children }: BalanceManagerProps) => {
  const contracts = useContracts();
  const { account } = useWeb3React();
  const {
    appState: { decimals },
    appDispatch,
  } = useAppState();
  const { config } = useEthereumConfig();

  const getUserTrancheBalances = useGetUserTrancheBalances(
    account || '',
    contracts?.vesting
  );
  const getAssociationBreakdown = useGetAssociationBreakdown(
    account || '',
    contracts?.staking,
    contracts?.vesting
  );

  // update balances on connect to Ethereum
  React.useEffect(() => {
    const updateBalances = async () => {
      if (!account || !config) return;
      try {
        const [b, w, stats, a] = await Promise.all([
          contracts.vesting.user_total_all_tranches(account),
          contracts.token.balanceOf(account),
          contracts.vesting.user_stats(account),
          contracts.token.allowance(
            account,
            config.staking_bridge_contract.address
          ),
        ]);

        const balance = toBigNum(b, decimals);
        const walletBalance = toBigNum(w, decimals);
        const lien = toBigNum(stats.lien, decimals);
        const allowance = toBigNum(a, decimals);

        appDispatch({
          type: AppStateActionType.UPDATE_ACCOUNT_BALANCES,
          balance,
          walletBalance,
          lien,
          allowance,
        });
      } catch (err) {
        Sentry.captureException(err);
      }
    };

    updateBalances();
  }, [
    decimals,
    appDispatch,
    contracts?.token,
    contracts?.vesting,
    account,
    config,
  ]);

  // This use effect hook is very expensive and is kept separate to prevent expensive reloading of data.
  React.useEffect(() => {
    if (account) {
      getUserTrancheBalances();
    }
  }, [account, getUserTrancheBalances]);

  React.useEffect(() => {
    if (account) {
      getAssociationBreakdown();
    }
  }, [account, getAssociationBreakdown]);

  return children;
};
