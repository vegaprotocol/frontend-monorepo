import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerAssetQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ExplorerAssetQuery = { __typename?: 'Query', asset?: { __typename?: 'Asset', id: string, name: string, status: Types.AssetStatus, decimals: number } | null };


export const ExplorerAssetDocument = gql`
    query ExplorerAsset($id: ID!) {
  asset(id: $id) {
    id
    name
    status
    decimals
  }
}
    `;

/**
 * __useExplorerAssetQuery__
 *
 * To run a query within a React component, call `useExplorerAssetQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerAssetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerAssetQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExplorerAssetQuery(baseOptions: Apollo.QueryHookOptions<ExplorerAssetQuery, ExplorerAssetQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerAssetQuery, ExplorerAssetQueryVariables>(ExplorerAssetDocument, options);
      }
export function useExplorerAssetLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerAssetQuery, ExplorerAssetQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerAssetQuery, ExplorerAssetQueryVariables>(ExplorerAssetDocument, options);
        }
export type ExplorerAssetQueryHookResult = ReturnType<typeof useExplorerAssetQuery>;
export type ExplorerAssetLazyQueryHookResult = ReturnType<typeof useExplorerAssetLazyQuery>;
export type ExplorerAssetQueryResult = Apollo.QueryResult<ExplorerAssetQuery, ExplorerAssetQueryVariables>;