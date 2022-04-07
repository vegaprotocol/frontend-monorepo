import { gql, useApolloClient } from "@apollo/client";
import * as Sentry from "@sentry/react";
import BigNumber from "bignumber.js";
import React from "react";

import { StakeLinkingStatus } from "../../../__generated__/globalTypes";
import { StakingMethod } from "../../../components/staking-method-radio";
import { useContracts } from "../../../contexts/contracts/contracts-context";
import { TxState } from "../../../hooks/transaction-reducer";
import { useGetAssociationBreakdown } from "../../../hooks/use-get-association-breakdown";
import { useRefreshBalances } from "../../../hooks/use-refresh-balances";
import { useTransaction } from "../../../hooks/use-transaction";
import {
  PartyStakeLinkings,
  PartyStakeLinkings_party_stake_linkings,
  PartyStakeLinkingsVariables,
} from "./__generated__/PartyStakeLinkings";

export const useAddStake = (
  address: string,
  amount: string,
  vegaKey: string,
  stakingMethod: StakingMethod | "",
  confirmations: number
) => {
  const { staking, vesting } = useContracts();
  const contractAdd = useTransaction(
    () => vesting.addStake(new BigNumber(amount), vegaKey, confirmations),
    confirmations
  );
  const walletAdd = useTransaction(
    () => staking.addStake(new BigNumber(amount), vegaKey, confirmations),
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

const PARTY_STAKE_LINKINGS = gql`
  query PartyStakeLinkings($partyId: ID!) {
    party(id: $partyId) {
      id
      stake {
        linkings {
          id
          txHash
          status
        }
      }
    }
  }
`;

export const usePollForStakeLinking = (
  partyId: string,
  txHash: string | null
) => {
  const client = useApolloClient();
  const [linking, setLinking] =
    React.useState<PartyStakeLinkings_party_stake_linkings | null>(null);

  // Query for linkings under current connected party (vega key)
  React.useEffect(() => {
    let interval: any;

    interval = setInterval(() => {
      if (!txHash || !partyId) return;

      client
        .query<PartyStakeLinkings, PartyStakeLinkingsVariables>({
          query: PARTY_STAKE_LINKINGS,
          variables: { partyId },
          // 'network-only' doesn't work here. Pretty wierd. no-cache just means its network only plus
          // the result is not stored in the cache
          fetchPolicy: "no-cache",
        })
        .then((res) => {
          const linkings = res.data?.party?.stake.linkings;

          if (!linkings?.length) return;

          const matchingLinking = linkings?.find((l) => {
            return (
              l.txHash === txHash && l.status === StakeLinkingStatus.Accepted
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
