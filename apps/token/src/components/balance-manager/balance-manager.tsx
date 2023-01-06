import * as Sentry from '@sentry/react';
import { toBigNum } from '@vegaprotocol/react-helpers';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useState } from 'react';

import { useAppState } from '../../contexts/app-state/app-state-context';
import { useContracts } from '../../contexts/contracts/contracts-context';
import { useGetAssociationBreakdown } from '../../hooks/use-get-association-breakdown';
import { useGetUserTrancheBalances } from '../../hooks/use-get-user-tranche-balances';
import { useBalances } from '../../lib/balances/balances-store';
import type { ReactElement } from 'react';
import type { Contract, EventFilter } from 'ethers';

interface BalanceManagerProps {
  children: ReactElement;
}

const useWaitForTransaction = (
  numberOfConfirmations: number,
  contract: Contract,
  filter: EventFilter
) => {
  const { provider } = useWeb3React();
  const [pendingBalances, setPendingBalances] = useState<any[]>([]);
  console.log(pendingBalances);

  useEffect(() => {
    if (!contract) {
      return;
    }

    const listener = async (...args: any[]) => {
      const receipt = args[3];
      setPendingBalances([...pendingBalances, receipt]);
      const tx = await receipt.getTransaction();
      await tx.wait(numberOfConfirmations);
      setPendingBalances(pendingBalances.filter((p) => p !== receipt));
    };

    contract?.on(filter, listener);

    return () => {
      contract?.off(filter, listener);
    };
  });

  const getExistingTransactions = useCallback(async () => {
    const blockNumber = (await provider?.getBlockNumber()) || 0;
    return await contract.queryFilter(
      filter,
      blockNumber - numberOfConfirmations
    );
  }, [contract, filter, numberOfConfirmations, provider]);

  const processWaitForExistingTransactions = useCallback(
    (addEvents: any[], numberOfConfirmations: number) => {
      addEvents.map(async (receipt) => {
        const tx = await receipt.getTransaction();
        const currentBlockNumber = (await provider?.getBlockNumber()) || 0;

        console.log(
          Math.max(
            tx.blockNumber + numberOfConfirmations - currentBlockNumber,
            0
          )
        );

        await tx.wait(
          Math.max(
            tx.blockNumber + numberOfConfirmations - currentBlockNumber,
            0
          )
        );

        setPendingBalances(pendingBalances.filter((p) => p !== receipt));
      });
    },
    [pendingBalances, provider]
  );

  useEffect(() => {
    let cancelled = false;
    getExistingTransactions().then((addEvents) => {
      if (!cancelled) {
        setPendingBalances(addEvents);
        processWaitForExistingTransactions(addEvents, numberOfConfirmations);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    getExistingTransactions,
    numberOfConfirmations,
    processWaitForExistingTransactions,
  ]);

  return pendingBalances;
};

const useListenForStakingEvents = (
  contract: Contract,
  vegaPublicKey: string,
  numberOfConfirmations: number
) => {
  const addFilter = contract.filters.Stake_Deposited(null, null, vegaPublicKey);
  const removeFilter = contract.filters.Stake_Removed(
    null,
    null,
    vegaPublicKey
  );

  const pendingAdds = useWaitForTransaction(
    numberOfConfirmations,
    contract,
    addFilter
  );

  const pendingRemoves = useWaitForTransaction(
    numberOfConfirmations,
    contract,
    removeFilter
  );

  return { pendingAdds, pendingRemoves };
};

export const BalanceManager = ({ children }: BalanceManagerProps) => {
  const contracts = useContracts();
  const { account } = useWeb3React();
  const {
    appState: { decimals },
  } = useAppState();
  const { updateBalances: updateStoreBalances } = useBalances();
  const { config } = useEthereumConfig();

  const numberOfConfirmations = 320;
  const vegaPublicKey =
    '0x99abc3dc34cf578befc5ca121e9a0d786d0defb708f9734cf18e1fe15d3253a5';

  // populate the initial state
  // process the transactions to know how much pending money we have
  // address our race conditions

  useListenForStakingEvents(
    contracts?.staking.contract,
    vegaPublicKey,
    numberOfConfirmations
  );

  useListenForStakingEvents(
    contracts?.vesting.contract,
    vegaPublicKey,
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
