import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketPositionsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type MarketPositionsQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', decimals: number }, market?: { __typename?: 'Market', id: string } | null } } | null> | null } | null, positionsConnection?: { __typename?: 'PositionConnection', edges?: Array<{ __typename?: 'PositionEdge', node: { __typename?: 'Position', openVolume: string, market: { __typename?: 'Market', id: string } } }> | null } | null } | null };


export const MarketPositionsDocument = gql`
    query MarketPositions($partyId: ID!) {
  party(id: $partyId) {
    id
    accountsConnection {
      edges {
        node {
          type
          balance
          asset {
            decimals
          }
          market {
            id
          }
        }
      }
    }
    positionsConnection {
      edges {
        node {
          openVolume
          market {
            id
          }
        }
      }
    }
  }
}
    `;

/**
 * __useMarketPositionsQuery__
 *
 * To run a query within a React component, call `useMarketPositionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketPositionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketPositionsQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useMarketPositionsQuery(baseOptions: Apollo.QueryHookOptions<MarketPositionsQuery, MarketPositionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketPositionsQuery, MarketPositionsQueryVariables>(MarketPositionsDocument, options);
      }
export function useMarketPositionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketPositionsQuery, MarketPositionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketPositionsQuery, MarketPositionsQueryVariables>(MarketPositionsDocument, options);
        }
export type MarketPositionsQueryHookResult = ReturnType<typeof useMarketPositionsQuery>;
export type MarketPositionsLazyQueryHookResult = ReturnType<typeof useMarketPositionsLazyQuery>;
export type MarketPositionsQueryResult = Apollo.QueryResult<MarketPositionsQuery, MarketPositionsQueryVariables>;