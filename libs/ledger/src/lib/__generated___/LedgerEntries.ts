import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type LedgerEntryFragment = { __typename?: 'AggregatedLedgerEntries', vegaTime: string, quantity: string, partyId?: string | null, assetId?: string | null, marketId?: string | null, accountType?: Types.AccountType | null, transferType?: string | null };

export type LedgerEntriesQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type LedgerEntriesQuery = { __typename?: 'Query', ledgerEntries: { __typename?: 'AggregatedLedgerEntriesConnection', edges: Array<{ __typename?: 'AggregatedLedgerEntriesEdge', node: { __typename?: 'AggregatedLedgerEntries', vegaTime: string, quantity: string, partyId?: string | null, assetId?: string | null, marketId?: string | null, accountType?: Types.AccountType | null, transferType?: string | null } } | null> } };

export const LedgerEntryFragmentDoc = gql`
    fragment LedgerEntry on AggregatedLedgerEntries {
  vegaTime
  quantity
  partyId
  assetId
  marketId
  accountType
  transferType
}
    `;
export const LedgerEntriesDocument = gql`
    query LedgerEntries($partyId: ID!) {
  ledgerEntries(
    filter: {AccountFromFilter: {partyIds: [$partyId]}}
    groupOptions: {ByAccountField: [PartyId, AccountType, AssetId, MarketId], ByLedgerEntryField: [TransferType]}
    pagination: {first: 500}
  ) {
    edges {
      node {
        ...LedgerEntry
      }
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