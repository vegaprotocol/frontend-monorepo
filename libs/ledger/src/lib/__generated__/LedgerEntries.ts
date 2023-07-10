import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type LedgerEntryFragment = { __typename: 'AggregatedLedgerEntry', vegaTime: any, quantity: string, assetId?: string | null, transferType?: Types.TransferType | null, toAccountType?: Types.AccountType | null, toAccountMarketId?: string | null, toAccountPartyId?: string | null, toAccountBalance: string, fromAccountType?: Types.AccountType | null, fromAccountMarketId?: string | null, fromAccountPartyId?: string | null, fromAccountBalance: string };

export type LedgerEntriesQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  pagination?: Types.InputMaybe<Types.Pagination>;
  dateRange?: Types.InputMaybe<Types.DateRange>;
  fromAccountType?: Types.InputMaybe<Array<Types.AccountType> | Types.AccountType>;
  toAccountType?: Types.InputMaybe<Array<Types.AccountType> | Types.AccountType>;
}>;


export type LedgerEntriesQuery = { __typename: 'Query', ledgerEntries: { __typename: 'AggregatedLedgerEntriesConnection', edges: Array<{ __typename: 'AggregatedLedgerEntriesEdge', cursor: string, node: { __typename: 'AggregatedLedgerEntry', vegaTime: any, quantity: string, assetId?: string | null, transferType?: Types.TransferType | null, toAccountType?: Types.AccountType | null, toAccountMarketId?: string | null, toAccountPartyId?: string | null, toAccountBalance: string, fromAccountType?: Types.AccountType | null, fromAccountMarketId?: string | null, fromAccountPartyId?: string | null, fromAccountBalance: string } } | null>, pageInfo: { __typename: 'PageInfo', startCursor: string, endCursor: string, hasNextPage: boolean, hasPreviousPage: boolean } } };

export const LedgerEntryFragmentDoc = gql`
    fragment LedgerEntry on AggregatedLedgerEntry {
  vegaTime
  quantity
  assetId
  transferType
  toAccountType
  toAccountMarketId
  toAccountPartyId
  toAccountBalance
  fromAccountType
  fromAccountMarketId
  fromAccountPartyId
  fromAccountBalance
}
    `;
export const LedgerEntriesDocument = gql`
    query LedgerEntries($partyId: ID!, $pagination: Pagination, $dateRange: DateRange, $fromAccountType: [AccountType!], $toAccountType: [AccountType!]) {
  ledgerEntries(
    filter: {FromAccountFilter: {partyIds: [$partyId], accountTypes: $fromAccountType}, ToAccountFilter: {partyIds: [$partyId], accountTypes: $toAccountType}}
    pagination: $pagination
    dateRange: $dateRange
  ) {
    edges {
      node {
        ...LedgerEntry
      }
      cursor
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
    ${LedgerEntryFragmentDoc}`;

/**
 * __useLedgerEntriesQuery__
 *
 * To run a query within a React component, call `useLedgerEntriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useLedgerEntriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLedgerEntriesQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *      pagination: // value for 'pagination'
 *      dateRange: // value for 'dateRange'
 *      fromAccountType: // value for 'fromAccountType'
 *      toAccountType: // value for 'toAccountType'
 *   },
 * });
 */
export function useLedgerEntriesQuery(baseOptions: Apollo.QueryHookOptions<LedgerEntriesQuery, LedgerEntriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LedgerEntriesQuery, LedgerEntriesQueryVariables>(LedgerEntriesDocument, options);
      }
export function useLedgerEntriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LedgerEntriesQuery, LedgerEntriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LedgerEntriesQuery, LedgerEntriesQueryVariables>(LedgerEntriesDocument, options);
        }
export type LedgerEntriesQueryHookResult = ReturnType<typeof useLedgerEntriesQuery>;
export type LedgerEntriesLazyQueryHookResult = ReturnType<typeof useLedgerEntriesLazyQuery>;
export type LedgerEntriesQueryResult = Apollo.QueryResult<LedgerEntriesQuery, LedgerEntriesQueryVariables>;