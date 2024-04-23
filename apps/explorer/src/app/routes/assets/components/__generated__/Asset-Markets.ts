import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AssetMarketsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AssetMarketsQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', id: string, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string } }, accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', id: string } } } | null> | null } | null } }> } | null };


export const AssetMarketsDocument = gql`
    query AssetMarkets {
  marketsConnection(includeSettled: false) {
    edges {
      node {
        id
        tradableInstrument {
          instrument {
            name
          }
        }
        accountsConnection {
          edges {
            node {
              type
              asset {
                id
              }
              balance
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useAssetMarketsQuery__
 *
 * To run a query within a React component, call `useAssetMarketsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAssetMarketsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssetMarketsQuery({
 *   variables: {
 *   },
 * });
 */
export function useAssetMarketsQuery(baseOptions?: Apollo.QueryHookOptions<AssetMarketsQuery, AssetMarketsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AssetMarketsQuery, AssetMarketsQueryVariables>(AssetMarketsDocument, options);
      }
export function useAssetMarketsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AssetMarketsQuery, AssetMarketsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AssetMarketsQuery, AssetMarketsQueryVariables>(AssetMarketsDocument, options);
        }
export type AssetMarketsQueryHookResult = ReturnType<typeof useAssetMarketsQuery>;
export type AssetMarketsLazyQueryHookResult = ReturnType<typeof useAssetMarketsLazyQuery>;
export type AssetMarketsQueryResult = Apollo.QueryResult<AssetMarketsQuery, AssetMarketsQueryVariables>;