import { useApolloClient } from '@apollo/client';
import * as Sentry from '@sentry/react';
import keyBy from 'lodash/keyBy';
import uniq from 'lodash/uniq';
import React from 'react';
import { useTranslation } from 'react-i18next';
import compact from 'lodash/compact';

import noIcon from '../../images/token-no-icon.png';
import vegaBlack from '../../images/vega_black.png';
import { BigNumber } from '../../lib/bignumber';
import type { WalletCardAssetProps } from '../wallet-card';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useContracts } from '../../contexts/contracts/contracts-context';
import type { ERC20Asset } from '@vegaprotocol/assets';
import { isAssetTypeERC20 } from '@vegaprotocol/assets';
import { Schema } from '@vegaprotocol/types';
import { toBigNum } from '@vegaprotocol/react-helpers';
import { useAppState } from '../../contexts/app-state/app-state-context';
import { addDecimal } from '@vegaprotocol/react-helpers';
import type {
  DelegationsQuery,
  DelegationsQueryVariables,
  WalletDelegationFieldsFragment,
} from './__generated___/Delegations';
import { DelegationsDocument } from './__generated___/Delegations';

export const usePollForDelegations = () => {
  const { token: vegaToken } = useContracts();
  const {
    appState: { decimals },
  } = useAppState();

  const { t } = useTranslation();
  const { pubKey } = useVegaWallet();
  const client = useApolloClient();
  const [delegations, setDelegations] = React.useState<
    WalletDelegationFieldsFragment[]
  >([]);
  const [delegatedNodes, setDelegatedNodes] = React.useState<
    {
      nodeId: string;
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
            variables: { partyId: pubKey },
            fetchPolicy: 'network-only',
          })
          .then((res) => {
            if (!mounted) return;
            const canonisedDelegations = compact(
              res.data.party?.delegationsConnection?.edges
            ).map(({ node }) => node);
            const filter =
              canonisedDelegations.filter((d) => {
                return d.epoch.toString() === res.data.epoch.id;
              }) || [];
            const sortedDelegations = [...filter].sort((a, b) => {
              return new BigNumber(b.amountFormatted)
                .minus(a.amountFormatted)
                .toNumber();
            });
            setDelegations(sortedDelegations);
            setCurrentStakeAvailable(
              toBigNum(
                res.data.party?.stakingSummary.currentStakeAvailable || 0,
                decimals
              )
            );
            const accounts = compact(
              res.data.party?.accountsConnection?.edges
            ).map((e) => e.node);
            setAccounts(
              accounts
                .filter(
                  (a) => a.type === Schema.AccountType.ACCOUNT_TYPE_GENERAL
                )
                .map((a) => {
                  const isVega =
                    isAssetTypeERC20(a.asset as ERC20Asset) &&
                    (a.asset as ERC20Asset).source.contractAddress ===
                      vegaToken.address;

                  return {
                    isVega,
                    name: a.asset.name,
                    subheading: isVega ? t('collateral') : a.asset.symbol,
                    symbol: a.asset.symbol,
                    decimals: a.asset.decimals,
                    balance: new BigNumber(
                      addDecimal(a.balance, a.asset.decimals)
                    ),
                    image: isVega ? vegaBlack : noIcon,
                    border: isVega,
                    address: isAssetTypeERC20(a.asset as ERC20Asset)
                      ? (a.asset as ERC20Asset).source.contractAddress
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
                  (delegatedThisEpoch[d]?.amountFormatted ||
                    delegatedNextEpoch[d]?.amountFormatted) &&
                  delegatedThisEpoch[d]?.amountFormatted !==
                    delegatedNextEpoch[d]?.amountFormatted &&
                  delegatedNextEpoch[d] !== undefined
                ),
                currentEpochStake:
                  delegatedThisEpoch[d] &&
                  new BigNumber(delegatedThisEpoch[d].amountFormatted),
                nextEpochStake:
                  delegatedNextEpoch[d] &&
                  new BigNumber(delegatedNextEpoch[d].amountFormatted),
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
  }, [client, decimals, pubKey, t, vegaToken.address]);

  return { delegations, currentStakeAvailable, delegatedNodes, accounts };
};
