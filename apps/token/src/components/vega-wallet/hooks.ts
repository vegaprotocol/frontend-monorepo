import { gql, useApolloClient } from "@apollo/client";
import * as Sentry from "@sentry/react";
import { keyBy, uniq } from "lodash";
import React from "react";
import { useTranslation } from "react-i18next";

import { AccountType } from "../../__generated__/globalTypes";
import { ADDRESSES } from "../../config";
import { useVegaUser } from "../../hooks/use-vega-user";
import noIcon from "../../images/token-no-icon.png";
import vegaBlack from "../../images/vega_black.png";
import { BigNumber } from "../../lib/bignumber";
import { addDecimal } from "../../lib/decimals";
import { WalletCardAssetProps } from "../wallet-card";
import {
  Delegations,
  Delegations_party_delegations,
  DelegationsVariables,
} from "./__generated__/Delegations";

const DELEGATIONS_QUERY = gql`
  query Delegations($partyId: ID!) {
    epoch {
      id
    }
    party(id: $partyId) {
      id
      delegations {
        amountFormatted @client
        amount
        node {
          id
          name
        }
        epoch
      }
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
  const { t } = useTranslation();
  const { currVegaKey } = useVegaUser();
  const client = useApolloClient();
  const [delegations, setDelegations] = React.useState<
    Delegations_party_delegations[]
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
    let interval: any;
    let mounted = true;

    if (currVegaKey?.pub) {
      // start polling for delegation
      interval = setInterval(() => {
        client
          .query<Delegations, DelegationsVariables>({
            query: DELEGATIONS_QUERY,
            variables: { partyId: currVegaKey.pub },
            fetchPolicy: "network-only",
          })
          .then((res) => {
            if (!mounted) return;
            const filter =
              res.data.party?.delegations?.filter((d) => {
                return d.epoch.toString() === res.data.epoch.id;
              }) || [];
            const sortedDelegations = [...filter].sort((a, b) => {
              return new BigNumber(b.amountFormatted)
                .minus(a.amountFormatted)
                .toNumber();
            });
            setDelegations(sortedDelegations);
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
                    a.asset.source.__typename === "ERC20" &&
                    a.asset.source.contractAddress ===
                      ADDRESSES.vegaTokenAddress;

                  return {
                    isVega,
                    name: a.asset.name,
                    subheading: isVega ? t("collateral") : a.asset.symbol,
                    symbol: a.asset.symbol,
                    decimals: a.asset.decimals,
                    balance: new BigNumber(
                      addDecimal(new BigNumber(a.balance), a.asset.decimals)
                    ),
                    image: isVega ? vegaBlack : noIcon,
                    border: isVega,
                    address:
                      a.asset.source.__typename === "ERC20"
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
              res.data.party?.delegations?.filter((d) => {
                return d.epoch === Number(res.data.epoch.id) + 1;
              }) || [],
              "node.id"
            );
            const delegatedThisEpoch = keyBy(
              res.data.party?.delegations?.filter((d) => {
                return d.epoch === Number(res.data.epoch.id);
              }) || [],
              "node.id"
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
                )
                  return 1;
                if (
                  new BigNumber(a.currentEpochStake || 0).isGreaterThan(
                    b.currentEpochStake || 0
                  )
                )
                  return -1;
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
  }, [client, currVegaKey?.pub, t]);

  return { delegations, currentStakeAvailable, delegatedNodes, accounts };
};
