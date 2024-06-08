import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AssetFieldsV2Fragment = { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string } };

export type AssetsV2QueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AssetsV2Query = { __typename?: 'Query', assetsConnection?: { __typename?: 'AssetsConnection', edges?: Array<{ __typename?: 'AssetEdge', node: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string } } } | null> | null } | null };

export const AssetFieldsV2FragmentDoc = gql`
    fragment AssetFieldsV2 on Asset {
  id
  name
  symbol
  decimals
  quantum
  status
  source {
    __typename
    ... on ERC20 {
      contractAddress
      lifetimeLimit
      withdrawThreshold
      chainId
    }
  }
}
    `;
export const AssetsV2Document = gql`
    query AssetsV2 {
  assetsConnection {
    edges {
      node {
        ...AssetFieldsV2
      }
    }
  }
}
    ${AssetFieldsV2FragmentDoc}`;

/**
 * __useAssetsV2Query__
 *
 * To run a query within a React component, call `useAssetsV2Query` and pass it any options that fit your needs.
 * When your component renders, `useAssetsV2Query` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssetsV2Query({
 *   variables: {
 *   },
 * });
 */
export function useAssetsV2Query(baseOptions?: Apollo.QueryHookOptions<AssetsV2Query, AssetsV2QueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AssetsV2Query, AssetsV2QueryVariables>(AssetsV2Document, options);
      }
export function useAssetsV2LazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AssetsV2Query, AssetsV2QueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AssetsV2Query, AssetsV2QueryVariables>(AssetsV2Document, options);
        }
export type AssetsV2QueryHookResult = ReturnType<typeof useAssetsV2Query>;
export type AssetsV2LazyQueryHookResult = ReturnType<typeof useAssetsV2LazyQuery>;
export type AssetsV2QueryResult = Apollo.QueryResult<AssetsV2Query, AssetsV2QueryVariables>;