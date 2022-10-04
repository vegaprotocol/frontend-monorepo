import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AccountFieldsFragment = { __typename?: 'Account', type: Types.AccountType, balance: string, market?: { __typename?: 'Market', id: string } | null, asset: { __typename?: 'Asset', id: string } };

export type AccountsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type AccountsQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, accounts?: Array<{ __typename?: 'Account', type: Types.AccountType, balance: string, market?: { __typename?: 'Market', id: string } | null, asset: { __typename?: 'Asset', id: string } }> | null } | null };

export type AccountEventsSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type AccountEventsSubscription = { __typename?: 'Subscription', accounts: Array<{ __typename?: 'AccountUpdate', type: Types.AccountType, balance: string, assetId: string, marketId?: string | null }> };

export type AssetsFieldsFragment = { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus };

export type AssetsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AssetsQuery = { __typename?: 'Query', assetsConnection?: { __typename?: 'AssetsConnection', edges?: Array<{ __typename?: 'AssetEdge', node: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus } } | null> | null } | null };

export const AccountFieldsFragmentDoc = gql`
    fragment AccountFields on Account {
  type
  balance
  market {
    id
  }
  asset {
    id
  }
}
    `;
export const AssetsFieldsFragmentDoc = gql`
    fragment AssetsFields on Asset {
  id
  name
  symbol
  decimals
  quantum
  status
}
    `;
export const AccountsDocument = gql`
    query Accounts($partyId: ID!) {
  party(id: $partyId) {
    id
    accounts {
      ...AccountFields
    }
  }
}
    ${AccountFieldsFragmentDoc}`;

/**
 * __useAccountsQuery__
 *
 * To run a query within a React component, call `useAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAccountsQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useAccountsQuery(baseOptions: Apollo.QueryHookOptions<AccountsQuery, AccountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AccountsQuery, AccountsQueryVariables>(AccountsDocument, options);
      }
export function useAccountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AccountsQuery, AccountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AccountsQuery, AccountsQueryVariables>(AccountsDocument, options);
        }
export type AccountsQueryHookResult = ReturnType<typeof useAccountsQuery>;
export type AccountsLazyQueryHookResult = ReturnType<typeof useAccountsLazyQuery>;
export type AccountsQueryResult = Apollo.QueryResult<AccountsQuery, AccountsQueryVariables>;
export const AccountEventsDocument = gql`
    subscription AccountEvents($partyId: ID!) {
  accounts(partyId: $partyId) {
    type
    balance
    assetId
    marketId
  }
}
    `;

/**
 * __useAccountEventsSubscription__
 *
 * To run a query within a React component, call `useAccountEventsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useAccountEventsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAccountEventsSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useAccountEventsSubscription(baseOptions: Apollo.SubscriptionHookOptions<AccountEventsSubscription, AccountEventsSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<AccountEventsSubscription, AccountEventsSubscriptionVariables>(AccountEventsDocument, options);
      }
export type AccountEventsSubscriptionHookResult = ReturnType<typeof useAccountEventsSubscription>;
export type AccountEventsSubscriptionResult = Apollo.SubscriptionResult<AccountEventsSubscription>;
export const AssetsDocument = gql`
    query Assets {
  assetsConnection {
    edges {
      node {
        ...AssetsFields
      }
    }
  }
}
    ${AssetsFieldsFragmentDoc}`;

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