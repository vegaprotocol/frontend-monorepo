import { gql, useApolloClient } from '@apollo/client';
import * as Sentry from '@sentry/react';
import keyBy from 'lodash/keyBy';
import uniq from 'lodash/uniq';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import noIcon from '../../images/token-no-icon.png';
import vegaBlack from '../../images/vega_black.png';
import { BigNumber } from '../../lib/bignumber';
import { addDecimal } from '../../lib/decimals';
import type { WalletCardAssetProps } from '../wallet-card';
import type {
  Delegations,
  DelegationsVariables,
} from './__generated__/Delegations';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useContracts } from '../../contexts/contracts/contracts-context';
import {
  isAssetTypeERC20,
  toBigNum,
  useFetch,
} from '@vegaprotocol/react-helpers';
import { AccountType } from '@vegaprotocol/types';
import { usePartyDelegations, DelegationsNode } from './use-delegations';
import { useAppState } from '../../contexts/app-state/app-state-context';

const DELEGATIONS_QUERY = gql`
  query Delegations($partyId: ID!) {
    epoch {
      id
    }
    party(id: $partyId) {
      id
      stake {
        currentStakeAvailable
        currentStakeAvailableFormatted @client
      }
      accounts {
        asset {
          name
          id
          decimals
          symbol
          source {
            __typename
            ... on ERC20 {
              contractAddress
            }
          }
        }
        type
        balance
      }
    }
  }
`;

export const usePollForDelegations = () => {
  const {
    appState: { decimals },
  } = useAppState();
  const { token: vegaToken } = useContracts();
  const { t } = useTranslation();
  const { keypair } = useVegaWallet();
  const client = useApolloClient();
  const [sortedDelegations, setSortedDelegations] = useState<
    DelegationsNode[] | undefined
  >(undefined);
  const delegations = usePartyDelegations(keypair?.pub);
  const [delegatedNodes, setDelegatedNodes] = useState<
    {
      nodeId: string;
      name: string | undefined;
      hasStakePending: boolean;
      currentEpochStake?: BigNumber;
      nextEpochStake?: BigNumber;
    }[]
  >([]);
  const [accounts, setAccounts] = useState<WalletCardAssetProps[]>([]);
  const [currentStakeAvailable, setCurrentStakeAvailable] = useState<BigNumber>(
    new BigNumber(0)
  );

  React.useEffect(() => {
    // eslint-disable-next-line
    let interval: any;
    let mounted = true;

    if (keypair?.pub) {
      // start polling for delegation
      interval = setInterval(() => {
        client
          .query<Delegations, DelegationsVariables>({
            query: DELEGATIONS_QUERY,
            variables: { partyId: keypair.pub },
            fetchPolicy: 'network-only',
          })
          .then((res) => {
            if (!mounted) return;
            const filter =
              delegations?.filter((d) => {
                return d.epochSeq === res.data.epoch.id;
              }) || [];
            const sortedDelegations = [...filter].sort((a, b) => {
              return new BigNumber(b.amount).minus(a.amount).toNumber();
            });
            setSortedDelegations(sortedDelegations);
            setCurrentStakeAvailable(
              new BigNumber(
                res.data.party?.stake.currentStakeAvailableFormatted || 0
              )
            );
            const accounts = res.data.party?.accounts || [];
            setAccounts(
              accounts
                .filter((a) => a.type === AccountType.General)
                .map((a) => {
                  const isVega =
                    isAssetTypeERC20(a.asset) &&
                    a.asset.source.contractAddress === vegaToken.address;

                  return {
                    isVega,
                    name: a.asset.name,
                    subheading: isVega ? t('collateral') : a.asset.symbol,
                    symbol: a.asset.symbol,
                    decimals: a.asset.decimals,
                    balance: new BigNumber(
                      addDecimal(new BigNumber(a.balance), a.asset.decimals)
                    ),
                    image: isVega ? vegaBlack : noIcon,
                    border: isVega,
                    address: isAssetTypeERC20(a.asset)
                      ? a.asset.source.contractAddress
                      : undefined,
                  };
                })
                .sort((a, b) => {
                  // Put VEGA at the top of the list
                  if (a.isVega) {
                    return -1;
                  }
                  if (b.isVega) {
                    return 1;
                  }
                  // Secondary sort by name
                  if (a.name < b.name) {
                    return -1;
                  }
                  if (a.name > b.name) {
                    return 1;
                  }
                  return 0;
                })
            );
            const delegatedNextEpoch = keyBy(
              delegations?.filter((d) => {
                return Number(d.epochSeq) === Number(res.data.epoch.id) + 1;
              }) || [],
              'nodeId'
            );
            const delegatedThisEpoch = keyBy(
              delegations?.filter((d) => {
                return d.epochSeq === res.data.epoch.id;
              }) || [],
              'nodeId'
            );
            const nodesDelegated = uniq([
              ...Object.keys(delegatedNextEpoch),
              ...Object.keys(delegatedThisEpoch),
            ]);
            console.log(delegatedNextEpoch);
            const delegatedAmounts = nodesDelegated
              .map((d) => ({
                nodeId: d,
                name:
                  delegatedThisEpoch[d]?.node?.name ||
                  delegatedNextEpoch[d]?.node?.name,
                hasStakePending: !!(
                  (delegatedThisEpoch[d]?.amount ||
                    delegatedNextEpoch[d]?.amount) &&
                  delegatedThisEpoch[d]?.amount !==
                    delegatedNextEpoch[d]?.amount &&
                  delegatedNextEpoch[d] !== undefined
                ),
                currentEpochStake:
                  delegatedThisEpoch[d] &&
                  toBigNum(delegatedThisEpoch[d].amount, decimals),
                nextEpochStake:
                  delegatedNextEpoch[d] &&
                  toBigNum(delegatedNextEpoch[d].amount, decimals),
              }))
              .sort((a, b) => {
                if (
                  new BigNumber(a.currentEpochStake || 0).isLessThan(
                    b.currentEpochStake || 0
                  )
                )
                  return 1;
                if (
                  new BigNumber(a.currentEpochStake || 0).isGreaterThan(
                    b.currentEpochStake || 0
                  )
                )
                  return -1;
                if ((!a.name && b.name) || a.name || '' < (b.name || ''))
                  return 1;
                if ((!b.name && a.name) || a.name || '' > (b.name || ''))
                  return -1;
                if (a.nodeId > b.nodeId) return 1;
                if (a.nodeId < b.nodeId) return -1;
                return 0;
              });

            setDelegatedNodes(delegatedAmounts);
          })
          .catch((err: Error) => {
            Sentry.captureException(err);
            // If query fails stop interval. Its almost certain that the query
            // will just continue to fail
            clearInterval(interval);
          });
      }, 1000);
    }

    return () => {
      clearInterval(interval);
      mounted = false;
    };
  }, [client, delegations, keypair?.pub, t, vegaToken.address]);

  return {
    delegations: sortedDelegations,
    currentStakeAvailable,
    delegatedNodes,
    accounts,
  };
};
