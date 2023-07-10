import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerNewAssetSignatureBundleQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ExplorerNewAssetSignatureBundleQuery = { __typename: 'Query', erc20ListAssetBundle?: { __typename: 'Erc20ListAssetBundle', signatures: string, nonce: string } | null, asset?: { __typename: 'Asset', status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string } } | null };

export type ExplorerUpdateAssetSignatureBundleQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ExplorerUpdateAssetSignatureBundleQuery = { __typename: 'Query', erc20SetAssetLimitsBundle: { __typename: 'ERC20SetAssetLimitsBundle', signatures: string, nonce: string }, asset?: { __typename: 'Asset', status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string } } | null };


export const ExplorerNewAssetSignatureBundleDocument = gql`
    query ExplorerNewAssetSignatureBundle($id: ID!) {
  erc20ListAssetBundle(assetId: $id) {
    signatures
    nonce
  }
  asset(id: $id) {
    status
    source {
      ... on ERC20 {
        contractAddress
      }
    }
  }
}
    `;

/**
 * __useExplorerNewAssetSignatureBundleQuery__
 *
 * To run a query within a React component, call `useExplorerNewAssetSignatureBundleQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerNewAssetSignatureBundleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerNewAssetSignatureBundleQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExplorerNewAssetSignatureBundleQuery(baseOptions: Apollo.QueryHookOptions<ExplorerNewAssetSignatureBundleQuery, ExplorerNewAssetSignatureBundleQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerNewAssetSignatureBundleQuery, ExplorerNewAssetSignatureBundleQueryVariables>(ExplorerNewAssetSignatureBundleDocument, options);
      }
export function useExplorerNewAssetSignatureBundleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerNewAssetSignatureBundleQuery, ExplorerNewAssetSignatureBundleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerNewAssetSignatureBundleQuery, ExplorerNewAssetSignatureBundleQueryVariables>(ExplorerNewAssetSignatureBundleDocument, options);
        }
export type ExplorerNewAssetSignatureBundleQueryHookResult = ReturnType<typeof useExplorerNewAssetSignatureBundleQuery>;
export type ExplorerNewAssetSignatureBundleLazyQueryHookResult = ReturnType<typeof useExplorerNewAssetSignatureBundleLazyQuery>;
export type ExplorerNewAssetSignatureBundleQueryResult = Apollo.QueryResult<ExplorerNewAssetSignatureBundleQuery, ExplorerNewAssetSignatureBundleQueryVariables>;
export const ExplorerUpdateAssetSignatureBundleDocument = gql`
    query ExplorerUpdateAssetSignatureBundle($id: ID!) {
  erc20SetAssetLimitsBundle(proposalId: $id) {
    signatures
    nonce
  }
  asset(id: $id) {
    status
    source {
      ... on ERC20 {
        contractAddress
      }
    }
  }
}
    `;

/**
 * __useExplorerUpdateAssetSignatureBundleQuery__
 *
 * To run a query within a React component, call `useExplorerUpdateAssetSignatureBundleQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerUpdateAssetSignatureBundleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerUpdateAssetSignatureBundleQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExplorerUpdateAssetSignatureBundleQuery(baseOptions: Apollo.QueryHookOptions<ExplorerUpdateAssetSignatureBundleQuery, ExplorerUpdateAssetSignatureBundleQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerUpdateAssetSignatureBundleQuery, ExplorerUpdateAssetSignatureBundleQueryVariables>(ExplorerUpdateAssetSignatureBundleDocument, options);
      }
export function useExplorerUpdateAssetSignatureBundleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerUpdateAssetSignatureBundleQuery, ExplorerUpdateAssetSignatureBundleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerUpdateAssetSignatureBundleQuery, ExplorerUpdateAssetSignatureBundleQueryVariables>(ExplorerUpdateAssetSignatureBundleDocument, options);
        }
export type ExplorerUpdateAssetSignatureBundleQueryHookResult = ReturnType<typeof useExplorerUpdateAssetSignatureBundleQuery>;
export type ExplorerUpdateAssetSignatureBundleLazyQueryHookResult = ReturnType<typeof useExplorerUpdateAssetSignatureBundleLazyQuery>;
export type ExplorerUpdateAssetSignatureBundleQueryResult = Apollo.QueryResult<ExplorerUpdateAssetSignatureBundleQuery, ExplorerUpdateAssetSignatureBundleQueryVariables>;