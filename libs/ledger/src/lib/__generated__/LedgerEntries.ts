import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type LedgerEntryFragment = { __typename?: 'AggregatedLedgerEntry', vegaTime: any, quantity: string, assetId?: string | null, transferType?: Types.TransferType | null, receiverAccountType?: Types.AccountType | null, receiverMarketId?: string | null, receiverPartyId?: string | null, senderAccountType?: Types.AccountType | null, senderMarketId?: string | null, senderPartyId?: string | null };

export type LedgerEntriesQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  pagination?: Types.InputMaybe<Types.Pagination>;
  dateRange?: Types.InputMaybe<Types.DateRange>;
  senderAccountType?: Types.InputMaybe<Array<Types.AccountType> | Types.AccountType>;
  receiverAccountType?: Types.InputMaybe<Array<Types.AccountType> | Types.AccountType>;
}>;


export type LedgerEntriesQuery = { __typename?: 'Query', ledgerEntries: { __typename?: 'AggregatedLedgerEntriesConnection', edges: Array<{ __typename?: 'AggregatedLedgerEntriesEdge', node: { __typename?: 'AggregatedLedgerEntry', vegaTime: any, quantity: string, assetId?: string | null, transferType?: Types.TransferType | null, receiverAccountType?: Types.AccountType | null, receiverMarketId?: string | null, receiverPartyId?: string | null, senderAccountType?: Types.AccountType | null, senderMarketId?: string | null, senderPartyId?: string | null } } | null>, pageInfo: { __typename?: 'PageInfo', startCursor: string, endCursor: string, hasNextPage: boolean, hasPreviousPage: boolean } } };

export const LedgerEntryFragmentDoc = gql`
    fragment LedgerEntry on AggregatedLedgerEntry {
  vegaTime
  quantity
  assetId
  transferType
  receiverAccountType
  receiverMarketId
  receiverPartyId
  senderAccountType
  senderMarketId
  senderPartyId
}
    `;
export const LedgerEntriesDocument = gql`
    query LedgerEntries($partyId: ID!, $pagination: Pagination, $dateRange: DateRange, $senderAccountType: [AccountType!], $receiverAccountType: [AccountType!]) {
  ledgerEntries(
    filter: {SenderAccountFilter: {partyIds: [$partyId], accountTypes: $senderAccountType}, ReceiverAccountFilter: {partyIds: [$partyId], accountTypes: $receiverAccountType}}
    pagination: $pagination
    dateRange: $dateRange
  ) {
    edges {
      node {
        ...LedgerEntry
      }
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
 *      senderAccountType: // value for 'senderAccountType'
 *      receiverAccountType: // value for 'receiverAccountType'
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