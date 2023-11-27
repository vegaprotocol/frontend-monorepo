import { useApolloClient } from '@apollo/client';
import * as Sentry from '@sentry/react';
import React from 'react';

import { StakingMethod } from '../../../components/staking-method-radio';
import { useContracts } from '../../../contexts/contracts/contracts-context';
import { TxState } from '../../../hooks/transaction-reducer';
import { useGetAssociationBreakdown } from '../../../hooks/use-get-association-breakdown';
import { useRefreshBalances } from '../../../hooks/use-refresh-balances';
import { useTransaction } from '../../../hooks/use-transaction';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import { removeDecimal, removePaginationWrapper } from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';
import {
  PartyStakeLinkingsDocument,
  type LinkingsFieldsFragment,
  type PartyStakeLinkingsQuery,
  type PartyStakeLinkingsQueryVariables,
} from './__generated__/PartyStakeLinkings';

export const useAddStake = (
  address: string,
  amount: string,
  vegaKey: string,
  stakingMethod: StakingMethod | null,
  confirmations: number
) => {
  const { staking, vesting } = useContracts();
  const {
    appState: { decimals },
  } = useAppState();
  const contractAdd = useTransaction(
    () => vesting.stake_tokens(removeDecimal(amount, decimals), vegaKey),
    confirmations
  );
  const walletAdd = useTransaction(
    () => staking.stake(removeDecimal(amount, decimals), vegaKey),
    confirmations
  );
  const refreshBalances = useRefreshBalances(address);
  const getAssociationBreakdown = useGetAssociationBreakdown(
    address,
    staking,
    vesting
  );

  React.useEffect(() => {
    if (
      walletAdd.state.txState === TxState.Complete ||
      contractAdd.state.txState === TxState.Complete
    ) {
      refreshBalances();
      getAssociationBreakdown();
    }
  }, [
    contractAdd.state.txState,
    refreshBalances,
    walletAdd.state.txState,
    getAssociationBreakdown,
  ]);

  return React.useMemo(() => {
    if (stakingMethod === StakingMethod.Contract) {
      return contractAdd;
    } else {
      return walletAdd;
    }
  }, [contractAdd, stakingMethod, walletAdd]);
};

export const usePollForStakeLinking = (
  partyId: string,
  txHash: string | null
) => {
  const client = useApolloClient();
  const [linking, setLinking] = React.useState<LinkingsFieldsFragment | null>(
    null
  );

  // Query for linkings under current connected party (vega key)
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!txHash || !partyId) return;

      client
        .query<PartyStakeLinkingsQuery, PartyStakeLinkingsQueryVariables>({
          query: PartyStakeLinkingsDocument,
          variables: { partyId },
          // 'network-only' doesn't work here. no-cache just means its network only plus
          // the result is not stored in the cache
          fetchPolicy: 'no-cache',
        })
        .then((res) => {
          const linkings = removePaginationWrapper(
            res.data?.party?.stakingSummary.linkings.edges
          );

          if (!linkings?.length) return;

          const matchingLinking = linkings?.find((l) => {
            return (
              l.txHash === txHash &&
              l.status === Schema.StakeLinkingStatus.STATUS_ACCEPTED
            );
          });

          if (matchingLinking) {
            setLinking(matchingLinking);
            clearInterval(interval);
          }
        })
        .catch((err) => {
          Sentry.captureException(err);
          clearInterval(interval);
        });
    }, 1000);

    return () => clearInterval(interval);
  }, [partyId, client, txHash]);

  return linking;
};
