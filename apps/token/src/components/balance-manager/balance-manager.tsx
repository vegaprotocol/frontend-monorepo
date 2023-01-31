import * as Sentry from '@sentry/react';
import { toBigNum } from '@vegaprotocol/react-helpers';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import { useEffect } from 'react';

import { useAppState } from '../../contexts/app-state/app-state-context';
import { useContracts } from '../../contexts/contracts/contracts-context';
import { useGetAssociationBreakdown } from '../../hooks/use-get-association-breakdown';
import { useBalances } from '../../lib/balances/balances-store';
import type { ReactElement } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useListenForStakingEvents as useListenForAssociationEvents } from '../../hooks/use-listen-for-staking-events';
import { useTranches } from '../../lib/tranches/tranches-store';

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

  const numberOfConfirmations = config?.confirmations || 0;

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

  const getTranches = useTranches((state) => state.getTranches);
  useEffect(() => {
    console.log(decimals);
    getTranches(decimals);
  }, [decimals, getTranches]);
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

  useEffect(() => {
    if (account) {
      getAssociationBreakdown();
    }
  }, [account, getAssociationBreakdown]);

  return children;
};
