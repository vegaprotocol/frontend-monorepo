import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type LossSocializationQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  marketId: Types.Scalars['ID'];
  pagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type LossSocializationQuery = { __typename?: 'Query', ledgerEntries: { __typename?: 'AggregatedLedgerEntriesConnection', edges: Array<{ __typename?: 'AggregatedLedgerEntriesEdge', cursor: string, node: { __typename?: 'AggregatedLedgerEntry', vegaTime: any, quantity: string, transferType?: Types.TransferType | null, toAccountType?: Types.AccountType | null, toAccountMarketId?: string | null, toAccountPartyId?: string | null, toAccountBalance: string, fromAccountType?: Types.AccountType | null, fromAccountMarketId?: string | null, fromAccountPartyId?: string | null, fromAccountBalance: string } } | null> } };


export const LossSocializationDocument = gql`
    query LossSocialization($partyId: ID!, $marketId: ID!, $pagination: Pagination) {
  ledgerEntries(
    filter: {FromAccountFilter: {partyIds: [$partyId], marketIds: [$marketId], accountTypes: [ACCOUNT_TYPE_MARGIN, ACCOUNT_TYPE_GENERAL]}, ToAccountFilter: {partyIds: [$partyId], marketIds: [$marketId], accountTypes: [ACCOUNT_TYPE_MARGIN, ACCOUNT_TYPE_GENERAL]}}
    pagination: $pagination
  ) {
    edges {
      node {
        vegaTime
        quantity
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
      cursor
    }
  }
}
    `;

/**
 * __useLossSocializationQuery__
 *
 * To run a query within a React component, call `useLossSocializationQuery` and pass it any options that fit your needs.
 * When your component renders, `useLossSocializationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLossSocializationQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *      marketId: // value for 'marketId'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useLossSocializationQuery(baseOptions: Apollo.QueryHookOptions<LossSocializationQuery, LossSocializationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LossSocializationQuery, LossSocializationQueryVariables>(LossSocializationDocument, options);
      }
export function useLossSocializationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LossSocializationQuery, LossSocializationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LossSocializationQuery, LossSocializationQueryVariables>(LossSocializationDocument, options);
        }
export type LossSocializationQueryHookResult = ReturnType<typeof useLossSocializationQuery>;
export type LossSocializationLazyQueryHookResult = ReturnType<typeof useLossSocializationLazyQuery>;
export type LossSocializationQueryResult = Apollo.QueryResult<LossSocializationQuery, LossSocializationQueryVariables>;