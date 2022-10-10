import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import { AssetFieldsFragmentDoc } from './Asset';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AssetsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AssetsQuery = { __typename?: 'Query', assetsConnection?: { __typename?: 'AssetsConnection', edges?: Array<{ __typename?: 'AssetEdge', node: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string }, infrastructureFeeAccount: { __typename?: 'Account', balance: string }, globalRewardPoolAccount?: { __typename?: 'Account', balance: string } | null, takerFeeRewardAccount?: { __typename?: 'Account', balance: string } | null, makerFeeRewardAccount?: { __typename?: 'Account', balance: string } | null, lpFeeRewardAccount?: { __typename?: 'Account', balance: string } | null, marketProposerRewardAccount?: { __typename?: 'Account', balance: string } | null } } | null> | null } | null };


export const AssetsDocument = gql`
    query Assets {
  assetsConnection {
    edges {
      node {
        ...AssetFields
      }
    }
  }
}
    ${AssetFieldsFragmentDoc}`;

/**
 * __useAssetsQuery__
 *
 * To run a query within a React component, call `useAssetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAssetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssetsQuery({
 *   variables: {
 *   },
 * });
 */
export function useAssetsQuery(baseOptions?: Apollo.QueryHookOptions<AssetsQuery, AssetsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AssetsQuery, AssetsQueryVariables>(AssetsDocument, options);
      }
export function useAssetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AssetsQuery, AssetsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AssetsQuery, AssetsQueryVariables>(AssetsDocument, options);
        }
export type AssetsQueryHookResult = ReturnType<typeof useAssetsQuery>;
export type AssetsLazyQueryHookResult = ReturnType<typeof useAssetsLazyQuery>;
export type AssetsQueryResult = Apollo.QueryResult<AssetsQuery, AssetsQueryVariables>;