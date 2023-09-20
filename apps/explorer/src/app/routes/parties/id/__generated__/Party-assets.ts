import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerPartyAssetsAccountsFragment = { __typename?: 'AccountBalance', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', name: string, id: string, decimals: number, symbol: string, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string } }, market?: { __typename?: 'Market', id: string, decimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string, product: { __typename?: 'Future', quoteName: string } | { __typename?: 'Perpetual', quoteName: string } | { __typename?: 'Spot' } } } } | null };

export type ExplorerPartyAssetsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type ExplorerPartyAssetsQuery = { __typename?: 'Query', partiesConnection?: { __typename?: 'PartyConnection', edges: Array<{ __typename?: 'PartyEdge', node: { __typename?: 'Party', id: string, delegationsConnection?: { __typename?: 'DelegationsConnection', edges?: Array<{ __typename?: 'DelegationEdge', node: { __typename?: 'Delegation', amount: string, epoch: number, node: { __typename?: 'Node', id: string, name: string } } } | null> | null } | null, stakingSummary: { __typename?: 'StakingSummary', currentStakeAvailable: string, linkings: { __typename?: 'StakesConnection', edges?: Array<{ __typename?: 'StakeLinkingEdge', node: { __typename?: 'StakeLinking', type: Types.StakeLinkingType, status: Types.StakeLinkingStatus, amount: string } } | null> | null } }, accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', name: string, id: string, decimals: number, symbol: string, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string } }, market?: { __typename?: 'Market', id: string, decimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string, product: { __typename?: 'Future', quoteName: string } | { __typename?: 'Perpetual', quoteName: string } | { __typename?: 'Spot' } } } } | null } } | null> | null } | null } }> } | null };

export const ExplorerPartyAssetsAccountsFragmentDoc = gql`
    fragment ExplorerPartyAssetsAccounts on AccountBalance {
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
  market {
    id
    decimalPlaces
    tradableInstrument {
      instrument {
        name
        product {
          ... on Future {
            quoteName
          }
          ... on Perpetual {
            quoteName
          }
        }
      }
    }
  }
}
    `;
export const ExplorerPartyAssetsDocument = gql`
    query ExplorerPartyAssets($partyId: ID!) {
  partiesConnection(id: $partyId) {
    edges {
      node {
        id
        delegationsConnection {
          edges {
            node {
              amount
              node {
                id
                name
              }
              epoch
            }
          }
        }
        stakingSummary {
          currentStakeAvailable
          linkings(pagination: {last: 100}) {
            edges {
              node {
                type
                status
                amount
              }
            }
          }
        }
        accountsConnection {
          edges {
            node {
              ...ExplorerPartyAssetsAccounts
            }
          }
        }
      }
    }
  }
}
    ${ExplorerPartyAssetsAccountsFragmentDoc}`;

/**
 * __useExplorerPartyAssetsQuery__
 *
 * To run a query within a React component, call `useExplorerPartyAssetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerPartyAssetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerPartyAssetsQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useExplorerPartyAssetsQuery(baseOptions: Apollo.QueryHookOptions<ExplorerPartyAssetsQuery, ExplorerPartyAssetsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerPartyAssetsQuery, ExplorerPartyAssetsQueryVariables>(ExplorerPartyAssetsDocument, options);
      }
export function useExplorerPartyAssetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerPartyAssetsQuery, ExplorerPartyAssetsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerPartyAssetsQuery, ExplorerPartyAssetsQueryVariables>(ExplorerPartyAssetsDocument, options);
        }
export type ExplorerPartyAssetsQueryHookResult = ReturnType<typeof useExplorerPartyAssetsQuery>;
export type ExplorerPartyAssetsLazyQueryHookResult = ReturnType<typeof useExplorerPartyAssetsLazyQuery>;
export type ExplorerPartyAssetsQueryResult = Apollo.QueryResult<ExplorerPartyAssetsQuery, ExplorerPartyAssetsQueryVariables>;