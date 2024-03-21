import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TradeFieldsFragment = { __typename?: 'Trade', id: string, price: string, size: string, createdAt: any, aggressor: Types.Side, type: Types.TradeType, market: { __typename?: 'Market', id: string } };

export type LatestTradesQueryVariables = Types.Exact<{
  marketIds?: Types.InputMaybe<Array<Types.Scalars['ID']> | Types.Scalars['ID']>;
  partyIds?: Types.InputMaybe<Array<Types.Scalars['ID']> | Types.Scalars['ID']>;
}>;


export type LatestTradesQuery = { __typename?: 'Query', trades?: { __typename?: 'TradeConnection', edges: Array<{ __typename?: 'TradeEdge', node: { __typename?: 'Trade', id: string, price: string, size: string, createdAt: any, aggressor: Types.Side, type: Types.TradeType, market: { __typename?: 'Market', id: string } } }> } | null };

export const TradeFieldsFragmentDoc = gql`
    fragment TradeFields on Trade {
  id
  price
  size
  createdAt
  aggressor
  market {
    id
  }
  type
}
    `;
export const LatestTradesDocument = gql`
    query LatestTrades($marketIds: [ID!], $partyIds: [ID!]) {
  trades(filter: {marketIds: $marketIds, partyIds: $partyIds}) {
    edges {
      node {
        ...TradeFields
      }
    }
  }
}
    ${TradeFieldsFragmentDoc}`;

/**
 * __useLatestTradesQuery__
 *
 * To run a query within a React component, call `useLatestTradesQuery` and pass it any options that fit your needs.
 * When your component renders, `useLatestTradesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLatestTradesQuery({
 *   variables: {
 *      marketIds: // value for 'marketIds'
 *      partyIds: // value for 'partyIds'
 *   },
 * });
 */
export function useLatestTradesQuery(baseOptions?: Apollo.QueryHookOptions<LatestTradesQuery, LatestTradesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LatestTradesQuery, LatestTradesQueryVariables>(LatestTradesDocument, options);
      }
export function useLatestTradesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LatestTradesQuery, LatestTradesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LatestTradesQuery, LatestTradesQueryVariables>(LatestTradesDocument, options);
        }
export type LatestTradesQueryHookResult = ReturnType<typeof useLatestTradesQuery>;
export type LatestTradesLazyQueryHookResult = ReturnType<typeof useLatestTradesLazyQuery>;
export type LatestTradesQueryResult = Apollo.QueryResult<LatestTradesQuery, LatestTradesQueryVariables>;