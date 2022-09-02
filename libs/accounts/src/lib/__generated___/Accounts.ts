import * as Types from '@vegaprotocol/types/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AccountFieldsFragment = { __typename?: 'Account', type: Types.AccountType, balance: string, market?: { __typename?: 'Market', id: string, name: string } | null, asset: { __typename?: 'Asset', id: string, symbol: string, decimals: number } };

export type AccountsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type AccountsQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, accountsConnection: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'Account', type: Types.AccountType, balance: string } } | null> | null } } | null };

export type AccountSubscribeSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type AccountSubscribeSubscription = { __typename?: 'Subscription', accounts: { __typename?: 'Account', type: Types.AccountType, balance: string } };

export const AccountFieldsFragmentDoc = gql`
    fragment AccountFields on Account {
  type
  balance
  market {
    id
    name
  }
  asset {
    id
    symbol
    decimals
  }
}
    `;
export const AccountsDocument = gql`
    query Accounts($partyId: ID!) {
  party(id: $partyId) {
    id
    accountsConnection {
      edges {
        node {
          type
          balance
        }
      }
    }
  }
}
    `;

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
export const AccountSubscribeDocument = gql`
    subscription AccountSubscribe($partyId: ID!) {
  accounts(partyId: $partyId) {
    type
    balance
  }
}
    `;

/**
 * __useAccountSubscribeSubscription__
 *
 * To run a query within a React component, call `useAccountSubscribeSubscription` and pass it any options that fit your needs.
 * When your component renders, `useAccountSubscribeSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAccountSubscribeSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useAccountSubscribeSubscription(baseOptions: Apollo.SubscriptionHookOptions<AccountSubscribeSubscription, AccountSubscribeSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<AccountSubscribeSubscription, AccountSubscribeSubscriptionVariables>(AccountSubscribeDocument, options);
      }
export type AccountSubscribeSubscriptionHookResult = ReturnType<typeof useAccountSubscribeSubscription>;
export type AccountSubscribeSubscriptionResult = Apollo.SubscriptionResult<AccountSubscribeSubscription>;