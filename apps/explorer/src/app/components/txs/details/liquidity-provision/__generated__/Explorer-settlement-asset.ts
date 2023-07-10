import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerSettlementAssetForMarketQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ExplorerSettlementAssetForMarketQuery = { __typename: 'Query', market?: { __typename: 'Market', id: string, decimalPlaces: number } | null };


export const ExplorerSettlementAssetForMarketDocument = gql`
    query ExplorerSettlementAssetForMarket($id: ID!) {
  market(id: $id) {
    id
    decimalPlaces
  }
}
    `;

/**
 * __useExplorerSettlementAssetForMarketQuery__
 *
 * To run a query within a React component, call `useExplorerSettlementAssetForMarketQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerSettlementAssetForMarketQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerSettlementAssetForMarketQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExplorerSettlementAssetForMarketQuery(baseOptions: Apollo.QueryHookOptions<ExplorerSettlementAssetForMarketQuery, ExplorerSettlementAssetForMarketQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerSettlementAssetForMarketQuery, ExplorerSettlementAssetForMarketQueryVariables>(ExplorerSettlementAssetForMarketDocument, options);
      }
export function useExplorerSettlementAssetForMarketLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerSettlementAssetForMarketQuery, ExplorerSettlementAssetForMarketQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerSettlementAssetForMarketQuery, ExplorerSettlementAssetForMarketQueryVariables>(ExplorerSettlementAssetForMarketDocument, options);
        }
export type ExplorerSettlementAssetForMarketQueryHookResult = ReturnType<typeof useExplorerSettlementAssetForMarketQuery>;
export type ExplorerSettlementAssetForMarketLazyQueryHookResult = ReturnType<typeof useExplorerSettlementAssetForMarketLazyQuery>;
export type ExplorerSettlementAssetForMarketQueryResult = Apollo.QueryResult<ExplorerSettlementAssetForMarketQuery, ExplorerSettlementAssetForMarketQueryVariables>;