import { useWeb3React } from '@web3-react/core';
import { useEffect } from 'react';

import { useAppState } from '../../contexts/app-state/app-state-context';
import { useContracts } from '../../contexts/contracts/contracts-context';
import { useGetAssociationBreakdown } from '../../hooks/use-get-association-breakdown';
import { useGetUserBalances } from '../../hooks/use-get-user-balances';
import { useBalances } from '../../lib/balances/balances-store';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useListenForStakingEvents as useListenForAssociationEvents } from '../../hooks/use-listen-for-staking-events';
import { useTranches } from '../../lib/tranches/tranches-store';
import { useUserTrancheBalances } from '../../routes/redemption/hooks';
import { useEthereumConfig } from '@vegaprotocol/web3';

/**
 * This does a lot..
 *
 * 1. gets and sets all user balances (token balance, total vesting,
 * total allowance, lien) to the useBalances zustand store
 *
 * 2. Starts listeners for association evens on the staking and vesting
 * contracts.
 *
 * 3. Gets tranche data and sets it to useTranches store
 *
 * 4. Gets and sets user associates in useBalances store
 */
export const BalanceManager = () => {
  const contracts = useContracts();
  const { pubKey } = useVegaWallet();
  const { account } = useWeb3React();
  const {
    appState: { decimals },
  } = useAppState();

  const updateStoreBalances = useBalances((state) => state.updateBalances);
  const setTranchesBalances = useBalances((state) => state.setTranchesBalances);
  const getUserBalances = useGetUserBalances(account);
  const userTrancheBalances = useUserTrancheBalances(account);

  useEffect(() => {
    setTranchesBalances(userTrancheBalances);
  }, [setTranchesBalances, userTrancheBalances]);

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

  return null;
};
