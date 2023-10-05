import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type FundingPaymentFieldsFragment = { __typename?: 'FundingPayment', marketId: string, partyId: string, fundingPeriodSeq: number, amount?: string | null, timestamp: any };

export type FundingPaymentsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  pagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type FundingPaymentsQuery = { __typename?: 'Query', fundingPayments: { __typename?: 'FundingPaymentConnection', edges: Array<{ __typename?: 'FundingPaymentEdge', cursor: string, node: { __typename?: 'FundingPayment', marketId: string, partyId: string, fundingPeriodSeq: number, amount?: string | null, timestamp: any } }>, pageInfo: { __typename?: 'PageInfo', startCursor: string, endCursor: string, hasNextPage: boolean, hasPreviousPage: boolean } } };

export const FundingPaymentFieldsFragmentDoc = gql`
    fragment FundingPaymentFields on FundingPayment {
  marketId
  partyId
  fundingPeriodSeq
  amount
  timestamp
}
    `;
export const FundingPaymentsDocument = gql`
    query FundingPayments($partyId: ID!, $pagination: Pagination) {
  fundingPayments(partyId: $partyId, pagination: $pagination) {
    edges {
      node {
        ...FundingPaymentFields
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
    ${FundingPaymentFieldsFragmentDoc}`;

/**
 * __useFundingPaymentsQuery__
 *
 * To run a query within a React component, call `useFundingPaymentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFundingPaymentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFundingPaymentsQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useFundingPaymentsQuery(baseOptions: Apollo.QueryHookOptions<FundingPaymentsQuery, FundingPaymentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FundingPaymentsQuery, FundingPaymentsQueryVariables>(FundingPaymentsDocument, options);
      }
export function useFundingPaymentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FundingPaymentsQuery, FundingPaymentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FundingPaymentsQuery, FundingPaymentsQueryVariables>(FundingPaymentsDocument, options);
        }
export type FundingPaymentsQueryHookResult = ReturnType<typeof useFundingPaymentsQuery>;
export type FundingPaymentsLazyQueryHookResult = ReturnType<typeof useFundingPaymentsLazyQuery>;
export type FundingPaymentsQueryResult = Apollo.QueryResult<FundingPaymentsQuery, FundingPaymentsQueryVariables>;