import { useApolloClient } from '@apollo/client';
import * as Sentry from '@sentry/react';
import keyBy from 'lodash/keyBy';
import uniq from 'lodash/uniq';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ENV } from '../../config';

import noIcon from '../../images/token-no-icon.png';
import vegaBlack from '../../images/vega_black.png';
import vegaVesting from '../../images/vega_vesting.png';
import { BigNumber } from '../../lib/bignumber';
import { type WalletCardAssetProps } from '../wallet-card';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useContracts } from '../../contexts/contracts/contracts-context';
import * as Schema from '@vegaprotocol/types';
import {
  addDecimal,
  isAssetTypeERC20,
  removePaginationWrapper,
  toBigNum,
} from '@vegaprotocol/utils';
import { useAppState } from '../../contexts/app-state/app-state-context';
import {
  DelegationsDocument,
  type DelegationsQuery,
  type DelegationsQueryVariables,
  type WalletDelegationFieldsFragment,
} from './__generated__/Delegations';
import { isPartyNotFoundError } from '../../lib/party';

export const usePollForDelegations = () => {
  const { token: vegaToken } = useContracts();
  const {
    appState: { decimals },
  } = useAppState();
  const { t } = useTranslation();
  const { pubKey } = useVegaWallet();
  const client = useApolloClient();
  const { delegationsPagination } = ENV;
  const [delegations, setDelegations] = React.useState<
    WalletDelegationFieldsFragment[]
  >([]);
  const [delegatedNodes, setDelegatedNodes] = React.useState<
    {
      nodeId: string;
      // eslint-disable-next-line
      name: string;
      hasStakePending: boolean;
      currentEpochStake?: BigNumber;
      nextEpochStake?: BigNumber;
    }[]
  >([]);
  const [accounts, setAccounts] = React.useState<WalletCardAssetProps[]>([]);
  const [currentStakeAvailable, setCurrentStakeAvailable] =
    React.useState<BigNumber>(new BigNumber(0));

  React.useEffect(() => {
    // eslint-disable-next-line
    let interval: any;
    let mounted = true;

    if (pubKey) {
      // start polling for delegation
      interval = setInterval(() => {
        client
          .query<DelegationsQuery, DelegationsQueryVariables>({
            query: DelegationsDocument,
            variables: {
              partyId: pubKey,
              delegationsPagination: delegationsPagination
                ? {
                    first: Number(delegationsPagination),
                  }
                : undefined,
            },
            fetchPolicy: 'network-only',
          })
          .then((res) => {
            if (!mounted) return;

            const canonisedDelegations = removePaginationWrapper(
              res.data.party?.delegationsConnection?.edges
            );
            const filter =
              canonisedDelegations.filter((d) => {
                return d.epoch.toString() === res.data.epoch.id;
              }) || [];
            const sortedDelegations = [...filter].sort((a, b) => {
              return toBigNum(b.amount, decimals)
                .minus(toBigNum(a.amount, decimals))
                .toNumber();
            });
            setDelegations(sortedDelegations);
            setCurrentStakeAvailable(
              toBigNum(
                res.data.party?.stakingSummary.currentStakeAvailable || 0,
                decimals
              )
            );
            const accounts = removePaginationWrapper(
              res.data.party?.accountsConnection?.edges
            );
            setAccounts(
              accounts
                .filter(
                  (a) =>
                    a.type === Schema.AccountType.ACCOUNT_TYPE_GENERAL ||
                    a.type === Schema.AccountType.ACCOUNT_TYPE_VESTED_REWARDS ||
                    a.type === Schema.AccountType.ACCOUNT_TYPE_VESTING_REWARDS
                )
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
                    assetId: a.asset.id,
                    balance: new BigNumber(
                      addDecimal(a.balance, a.asset.decimals)
                    ),
                    image: isVega
                      ? vegaBlack
                      : a.type ===
                          Schema.AccountType.ACCOUNT_TYPE_VESTED_REWARDS ||
                        a.type ===
                          Schema.AccountType.ACCOUNT_TYPE_VESTING_REWARDS
                      ? vegaVesting
                      : noIcon,
                    border: isVega,
                    address: isAssetTypeERC20(a.asset)
                      ? a.asset.source.contractAddress
                      : undefined,
                    type: a.type,
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
              canonisedDelegations.filter((d) => {
                return d.epoch === Number(res.data.epoch.id) + 1;
              }) || [],
              'node.id'
            );
            const delegatedThisEpoch = keyBy(
              canonisedDelegations.filter((d) => {
                return d.epoch === Number(res.data.epoch.id);
              }) || [],
              'node.id'
            );
            const nodesDelegated = uniq([
              ...Object.keys(delegatedNextEpoch),
              ...Object.keys(delegatedThisEpoch),
            ]);

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
                ) {
                  return 1;
                }
                if (
                  new BigNumber(a.currentEpochStake || 0).isGreaterThan(
                    b.currentEpochStake || 0
                  )
                ) {
                  return -1;
                }
                if ((!a.name && b.name) || a.name < b.name) return 1;
                if ((!b.name && a.name) || a.name > b.name) return -1;
                if (a.nodeId > b.nodeId) return 1;
                if (a.nodeId < b.nodeId) return -1;
                return 0;
              });

            setDelegatedNodes(delegatedAmounts);
          })
          .catch((err: Error) => {
            // if party isn't found, dont log to Sentry, just clear state as, user
            // will not have any delagations or accounts
            if (isPartyNotFoundError(err)) {
              setDelegations([]);
              setAccounts([]);
              setDelegatedNodes([]);
              setCurrentStakeAvailable(new BigNumber(0));
              return;
            }
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
  }, [delegationsPagination, client, decimals, pubKey, t, vegaToken.address]);

  return { delegations, currentStakeAvailable, delegatedNodes, accounts };
};
