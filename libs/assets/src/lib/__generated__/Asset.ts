import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AssetFieldsFragment = { __typename: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string }, infrastructureFeeAccount?: { __typename: 'AccountBalance', balance: string } | null, globalRewardPoolAccount?: { __typename: 'AccountBalance', balance: string } | null, takerFeeRewardAccount?: { __typename: 'AccountBalance', balance: string } | null, makerFeeRewardAccount?: { __typename: 'AccountBalance', balance: string } | null, lpFeeRewardAccount?: { __typename: 'AccountBalance', balance: string } | null, marketProposerRewardAccount?: { __typename: 'AccountBalance', balance: string } | null };

export type AssetQueryVariables = Types.Exact<{
  assetId: Types.Scalars['ID'];
}>;


export type AssetQuery = { __typename: 'Query', assetsConnection?: { __typename: 'AssetsConnection', edges?: Array<{ __typename: 'AssetEdge', node: { __typename: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string }, infrastructureFeeAccount?: { __typename: 'AccountBalance', balance: string } | null, globalRewardPoolAccount?: { __typename: 'AccountBalance', balance: string } | null, takerFeeRewardAccount?: { __typename: 'AccountBalance', balance: string } | null, makerFeeRewardAccount?: { __typename: 'AccountBalance', balance: string } | null, lpFeeRewardAccount?: { __typename: 'AccountBalance', balance: string } | null, marketProposerRewardAccount?: { __typename: 'AccountBalance', balance: string } | null } } | null> | null } | null };

export const AssetFieldsFragmentDoc = gql`
    fragment AssetFields on Asset {
  id
  name
  symbol
  decimals
  quantum
  source {
    __typename
    ... on ERC20 {
      contractAddress
      lifetimeLimit
      withdrawThreshold
    }
    ... on BuiltinAsset {
      maxFaucetAmountMint
    }
  }
  status
  infrastructureFeeAccount {
    balance
  }
  globalRewardPoolAccount {
    balance
  }
  takerFeeRewardAccount {
    balance
  }
  makerFeeRewardAccount {
    balance
  }
  lpFeeRewardAccount {
    balance
  }
  marketProposerRewardAccount {
    balance
  }
}
    `;
export const AssetDocument = gql`
    query Asset($assetId: ID!) {
  assetsConnection(id: $assetId) {
    edges {
      node {
        ...AssetFields
      }
    }
  }
}
    ${AssetFieldsFragmentDoc}`;

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