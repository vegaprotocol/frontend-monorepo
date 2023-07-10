import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AccountHistoryQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  assetId: Types.Scalars['ID'];
  accountTypes?: Types.InputMaybe<Array<Types.AccountType> | Types.AccountType>;
  dateRange?: Types.InputMaybe<Types.DateRange>;
  marketIds?: Types.InputMaybe<Array<Types.Scalars['ID']> | Types.Scalars['ID']>;
}>;


export type AccountHistoryQuery = { __typename: 'Query', balanceChanges: { __typename: 'AggregatedBalanceConnection', edges: Array<{ __typename: 'AggregatedBalanceEdge', node: { __typename: 'AggregatedBalance', timestamp: any, partyId?: string | null, balance: string, marketId?: string | null, assetId?: string | null, accountType?: Types.AccountType | null } } | null> } };

export type AccountsWithBalanceQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  dateRange?: Types.InputMaybe<Types.DateRange>;
}>;


export type AccountsWithBalanceQuery = { __typename: 'Query', balanceChanges: { __typename: 'AggregatedBalanceConnection', edges: Array<{ __typename: 'AggregatedBalanceEdge', node: { __typename: 'AggregatedBalance', assetId?: string | null, accountType?: Types.AccountType | null } } | null> } };


export const AccountHistoryDocument = gql`
    query AccountHistory($partyId: ID!, $assetId: ID!, $accountTypes: [AccountType!], $dateRange: DateRange, $marketIds: [ID!]) {
  balanceChanges(
    filter: {partyIds: [$partyId], accountTypes: $accountTypes, assetId: $assetId, marketIds: $marketIds}
    dateRange: $dateRange
  ) {
    edges {
      node {
        timestamp
        partyId
        balance
        marketId
        assetId
        accountType
      }
    }
  }
}
    `;

/**
 * __useAccountHistoryQuery__
 *
 * To run a query within a React component, call `useAccountHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useAccountHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAccountHistoryQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *      assetId: // value for 'assetId'
 *      accountTypes: // value for 'accountTypes'
 *      dateRange: // value for 'dateRange'
 *      marketIds: // value for 'marketIds'
 *   },
 * });
 */
export function useAccountHistoryQuery(baseOptions: Apollo.QueryHookOptions<AccountHistoryQuery, AccountHistoryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AccountHistoryQuery, AccountHistoryQueryVariables>(AccountHistoryDocument, options);
      }
export function useAccountHistoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AccountHistoryQuery, AccountHistoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AccountHistoryQuery, AccountHistoryQueryVariables>(AccountHistoryDocument, options);
        }
export type AccountHistoryQueryHookResult = ReturnType<typeof useAccountHistoryQuery>;
export type AccountHistoryLazyQueryHookResult = ReturnType<typeof useAccountHistoryLazyQuery>;
export type AccountHistoryQueryResult = Apollo.QueryResult<AccountHistoryQuery, AccountHistoryQueryVariables>;
export const AccountsWithBalanceDocument = gql`
    query AccountsWithBalance($partyId: ID!, $dateRange: DateRange) {
  balanceChanges(filter: {partyIds: [$partyId]}, dateRange: $dateRange) {
    edges {
      node {
        assetId
        accountType
      }
    }
  }
}
    `;

/**
 * __useAccountsWithBalanceQuery__
 *
 * To run a query within a React component, call `useAccountsWithBalanceQuery` and pass it any options that fit your needs.
 * When your component renders, `useAccountsWithBalanceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAccountsWithBalanceQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *      dateRange: // value for 'dateRange'
 *   },
 * });
 */
export function useAccountsWithBalanceQuery(baseOptions: Apollo.QueryHookOptions<AccountsWithBalanceQuery, AccountsWithBalanceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AccountsWithBalanceQuery, AccountsWithBalanceQueryVariables>(AccountsWithBalanceDocument, options);
      }
export function useAccountsWithBalanceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AccountsWithBalanceQuery, AccountsWithBalanceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AccountsWithBalanceQuery, AccountsWithBalanceQueryVariables>(AccountsWithBalanceDocument, options);
        }
export type AccountsWithBalanceQueryHookResult = ReturnType<typeof useAccountsWithBalanceQuery>;
export type AccountsWithBalanceLazyQueryHookResult = ReturnType<typeof useAccountsWithBalanceLazyQuery>;
export type AccountsWithBalanceQueryResult = Apollo.QueryResult<AccountsWithBalanceQuery, AccountsWithBalanceQueryVariables>;