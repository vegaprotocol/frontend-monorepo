import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TransferFeeQueryVariables = Types.Exact<{
  fromAccount: Types.Scalars['ID'];
  fromAccountType: Types.AccountType;
  toAccount: Types.Scalars['ID'];
  amount: Types.Scalars['String'];
  assetId: Types.Scalars['String'];
}>;


export type TransferFeeQuery = { __typename?: 'Query', estimateTransferFee?: { __typename?: 'EstimatedTransferFee', fee: string, discount: string } | null };


export const TransferFeeDocument = gql`
    query TransferFee($fromAccount: ID!, $fromAccountType: AccountType!, $toAccount: ID!, $amount: String!, $assetId: String!) {
  estimateTransferFee(
    fromAccount: $fromAccount
    fromAccountType: $fromAccountType
    toAccount: $toAccount
    amount: $amount
    assetId: $assetId
  ) {
    fee
    discount
  }
}
    `;

/**
 * __useTransferFeeQuery__
 *
 * To run a query within a React component, call `useTransferFeeQuery` and pass it any options that fit your needs.
 * When your component renders, `useTransferFeeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTransferFeeQuery({
 *   variables: {
 *      fromAccount: // value for 'fromAccount'
 *      fromAccountType: // value for 'fromAccountType'
 *      toAccount: // value for 'toAccount'
 *      amount: // value for 'amount'
 *      assetId: // value for 'assetId'
 *   },
 * });
 */
export function useTransferFeeQuery(baseOptions: Apollo.QueryHookOptions<TransferFeeQuery, TransferFeeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TransferFeeQuery, TransferFeeQueryVariables>(TransferFeeDocument, options);
      }
export function useTransferFeeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TransferFeeQuery, TransferFeeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TransferFeeQuery, TransferFeeQueryVariables>(TransferFeeDocument, options);
        }
export type TransferFeeQueryHookResult = ReturnType<typeof useTransferFeeQuery>;
export type TransferFeeLazyQueryHookResult = ReturnType<typeof useTransferFeeLazyQuery>;
export type TransferFeeQueryResult = Apollo.QueryResult<TransferFeeQuery, TransferFeeQueryVariables>;