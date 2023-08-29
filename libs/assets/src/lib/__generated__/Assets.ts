import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AssetListFieldsFragment = { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string } };

export type AssetsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AssetsQuery = { __typename?: 'Query', assetsConnection?: { __typename?: 'AssetsConnection', edges?: Array<{ __typename?: 'AssetEdge', node: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string } } } | null> | null } | null };

export type PartyAssetFieldsFragment = { __typename?: 'Asset', id: string, name: string, symbol: string, status: Types.AssetStatus };

export type PartyAssetsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type PartyAssetsQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', type: Types.AccountType, asset: { __typename?: 'Asset', id: string, name: string, symbol: string, status: Types.AssetStatus } } } | null> | null } | null } | null };

export const AssetListFieldsFragmentDoc = gql`
    fragment AssetListFields on Asset {
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
  }
  status
}
    `;
export const PartyAssetFieldsFragmentDoc = gql`
    fragment PartyAssetFields on Asset {
  id
  name
  symbol
  status
}
    `;
export const AssetsDocument = gql`
    query Assets {
  assetsConnection {
    edges {
      node {
        ...AssetListFields
      }
    }
  }
}
    ${AssetListFieldsFragmentDoc}`;

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
export const PartyAssetsDocument = gql`
    query PartyAssets($partyId: ID!) {
  party(id: $partyId) {
    id
    accountsConnection {
      edges {
        node {
          type
          asset {
            ...PartyAssetFields
          }
        }
      }
    }
  }
}
    ${PartyAssetFieldsFragmentDoc}`;

/**
 * __usePartyAssetsQuery__
 *
 * To run a query within a React component, call `usePartyAssetsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePartyAssetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePartyAssetsQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function usePartyAssetsQuery(baseOptions: Apollo.QueryHookOptions<PartyAssetsQuery, PartyAssetsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PartyAssetsQuery, PartyAssetsQueryVariables>(PartyAssetsDocument, options);
      }
export function usePartyAssetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PartyAssetsQuery, PartyAssetsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PartyAssetsQuery, PartyAssetsQueryVariables>(PartyAssetsDocument, options);
        }
export type PartyAssetsQueryHookResult = ReturnType<typeof usePartyAssetsQuery>;
export type PartyAssetsLazyQueryHookResult = ReturnType<typeof usePartyAssetsLazyQuery>;
export type PartyAssetsQueryResult = Apollo.QueryResult<PartyAssetsQuery, PartyAssetsQueryVariables>;