import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AssetQueryVariables = Types.Exact<{
  assetId: Types.Scalars['ID'];
}>;


export type AssetQuery = { __typename?: 'Query', asset?: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string } } | null };


export const AssetDocument = gql`
    query Asset($assetId: ID!) {
  asset(id: $assetId) {
    id
    name
    symbol
    decimals
    quantum
    source {
      ... on ERC20 {
        contractAddress
        lifetimeLimit
        withdrawThreshold
      }
    }
  }
}
    `;

/**
 * __useAssetQuery__
 *
 * To run a query within a React component, call `useAssetQuery` and pass it any options that fit your needs.
 * When your component renders, `useAssetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssetQuery({
 *   variables: {
 *      assetId: // value for 'assetId'
 *   },
 * });
 */
export function useAssetQuery(baseOptions: Apollo.QueryHookOptions<AssetQuery, AssetQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AssetQuery, AssetQueryVariables>(AssetDocument, options);
      }
export function useAssetLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AssetQuery, AssetQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AssetQuery, AssetQueryVariables>(AssetDocument, options);
        }
export type AssetQueryHookResult = ReturnType<typeof useAssetQuery>;
export type AssetLazyQueryHookResult = ReturnType<typeof useAssetLazyQuery>;
export type AssetQueryResult = Apollo.QueryResult<AssetQuery, AssetQueryVariables>;