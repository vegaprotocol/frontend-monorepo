import * as Sentry from '@sentry/react';
import { toBigNum } from '@vegaprotocol/react-helpers';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useRef } from 'react';

import { useAppState } from '../../contexts/app-state/app-state-context';
import { useContracts } from '../../contexts/contracts/contracts-context';
import { useGetAssociationBreakdown } from '../../hooks/use-get-association-breakdown';
import { useGetUserTrancheBalances } from '../../hooks/use-get-user-tranche-balances';
import { useBalances } from '../../lib/balances/balances-store';
import type { ReactElement } from 'react';
import { useListenForStakingEvents as useListenForAssociationEvents } from '../../hooks/use-pending-balances-manager';
import { useVegaWallet } from '@vegaprotocol/wallet';

interface BalanceManagerProps {
  children: ReactElement;
}

export const BalanceManager = ({ children }: BalanceManagerProps) => {
  const contracts = useContracts();
  const { pubKey } = useVegaWallet();
  const { account } = useWeb3React();
  const {
    appState: { decimals },
  } = useAppState();
  const { updateBalances: updateStoreBalances } = useBalances();
  const { config } = useEthereumConfig();

  const numberOfConfirmations = 100;

  // breaks if no provider?

  useListenForAssociationEvents(
    contracts?.staking.contract,
    pubKey,
    numberOfConfirmations
  );

  useListenForAssociationEvents(
    contracts?.vesting.contract,
    pubKey,
    numberOfConfirmations
  );

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
  useEffect(() => {
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

        updateStoreBalances({
          balanceFormatted: balance,
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
    contracts.token,
    contracts.vesting,
    account,
    config,
    updateStoreBalances,
  ]);

  // This use effect hook is very expensive and is kept separate to prevent expensive reloading of data.
  useEffect(() => {
    if (account) {
      getUserTrancheBalances();
    }
  }, [account, getUserTrancheBalances]);

  useEffect(() => {
    if (account) {
      getAssociationBreakdown();
    }
  }, [account, getAssociationBreakdown]);

  return children;
};
