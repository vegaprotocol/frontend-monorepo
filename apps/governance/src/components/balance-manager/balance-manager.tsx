import { useWeb3React } from '@web3-react/core';
import { useEffect } from 'react';

import { useAppState } from '../../contexts/app-state/app-state-context';
import { useContracts } from '../../contexts/contracts/contracts-context';
import { useGetAssociationBreakdown } from '../../hooks/use-get-association-breakdown';
import { useGetUserBalances } from '../../hooks/use-get-user-balances';
import { useBalances } from '../../lib/balances/balances-store';
import type { ReactElement } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useListenForStakingEvents as useListenForAssociationEvents } from '../../hooks/use-listen-for-staking-events';
import { useTranches } from '../../lib/tranches/tranches-store';
import { useEthereumConfig } from '@vegaprotocol/web3';

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
  const updateStoreBalances = useBalances((state) => state.updateBalances);
  const getUserBalances = useGetUserBalances(account);

  const { config } = useEthereumConfig();

  const numberOfConfirmations = config?.confirmations || 0;

  useListenForAssociationEvents(
    contracts?.staking.contract,
    pubKey,
    numberOfConfirmations
  );

  const getTranches = useTranches((state) => state.getTranches);
  useEffect(() => {
    getTranches(decimals);
  }, [decimals, getTranches]);
  const getAssociationBreakdown = useGetAssociationBreakdown(
    account || '',
    contracts?.staking
  );

  // update balances on connect to Ethereum
  useEffect(() => {
    const updateBalances = async () => {
      const balances = await getUserBalances();
      if (balances) {
        updateStoreBalances(balances);
      }
    };

    updateBalances();
  }, [getUserBalances, updateStoreBalances]);

  useEffect(() => {
    if (account) {
      getAssociationBreakdown();
    }
  }, [account, getAssociationBreakdown]);

  return children;
};
