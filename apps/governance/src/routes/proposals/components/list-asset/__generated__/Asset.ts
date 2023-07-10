import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProposalAssetQueryVariables = Types.Exact<{
  assetId: Types.Scalars['ID'];
}>;


export type ProposalAssetQuery = { __typename: 'Query', asset?: { __typename: 'Asset', status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string } } | null };

export type AssetListBundleQueryVariables = Types.Exact<{
  assetId: Types.Scalars['ID'];
}>;


export type AssetListBundleQuery = { __typename: 'Query', erc20ListAssetBundle?: { __typename: 'Erc20ListAssetBundle', assetSource: string, vegaAssetId: string, nonce: string, signatures: string } | null };


export const ProposalAssetDocument = gql`
    query ProposalAsset($assetId: ID!) {
  asset(id: $assetId) {
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
 * __useProposalAssetQuery__
 *
 * To run a query within a React component, call `useProposalAssetQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalAssetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalAssetQuery({
 *   variables: {
 *      assetId: // value for 'assetId'
 *   },
 * });
 */
export function useProposalAssetQuery(baseOptions: Apollo.QueryHookOptions<ProposalAssetQuery, ProposalAssetQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProposalAssetQuery, ProposalAssetQueryVariables>(ProposalAssetDocument, options);
      }
export function useProposalAssetLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProposalAssetQuery, ProposalAssetQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProposalAssetQuery, ProposalAssetQueryVariables>(ProposalAssetDocument, options);
        }
export type ProposalAssetQueryHookResult = ReturnType<typeof useProposalAssetQuery>;
export type ProposalAssetLazyQueryHookResult = ReturnType<typeof useProposalAssetLazyQuery>;
export type ProposalAssetQueryResult = Apollo.QueryResult<ProposalAssetQuery, ProposalAssetQueryVariables>;
export const AssetListBundleDocument = gql`
    query AssetListBundle($assetId: ID!) {
  erc20ListAssetBundle(assetId: $assetId) {
    assetSource
    vegaAssetId
    nonce
    signatures
  }
}
    `;

/**
 * __useAssetListBundleQuery__
 *
 * To run a query within a React component, call `useAssetListBundleQuery` and pass it any options that fit your needs.
 * When your component renders, `useAssetListBundleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssetListBundleQuery({
 *   variables: {
 *      assetId: // value for 'assetId'
 *   },
 * });
 */
export function useAssetListBundleQuery(baseOptions: Apollo.QueryHookOptions<AssetListBundleQuery, AssetListBundleQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AssetListBundleQuery, AssetListBundleQueryVariables>(AssetListBundleDocument, options);
      }
export function useAssetListBundleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AssetListBundleQuery, AssetListBundleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AssetListBundleQuery, AssetListBundleQueryVariables>(AssetListBundleDocument, options);
        }
export type AssetListBundleQueryHookResult = ReturnType<typeof useAssetListBundleQuery>;
export type AssetListBundleLazyQueryHookResult = ReturnType<typeof useAssetListBundleLazyQuery>;
export type AssetListBundleQueryResult = Apollo.QueryResult<AssetListBundleQuery, AssetListBundleQueryVariables>;