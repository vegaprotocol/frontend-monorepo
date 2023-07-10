import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type WithdrawalApprovalQueryVariables = Types.Exact<{
  withdrawalId: Types.Scalars['ID'];
}>;


export type WithdrawalApprovalQuery = { __typename: 'Query', erc20WithdrawalApproval?: { __typename: 'Erc20WithdrawalApproval', assetSource: string, amount: string, nonce: string, signatures: string, targetAddress: string, creation: string } | null };


export const WithdrawalApprovalDocument = gql`
    query WithdrawalApproval($withdrawalId: ID!) {
  erc20WithdrawalApproval(withdrawalId: $withdrawalId) {
    assetSource
    amount
    nonce
    signatures
    targetAddress
    creation
  }
}
    `;

/**
 * __useWithdrawalApprovalQuery__
 *
 * To run a query within a React component, call `useWithdrawalApprovalQuery` and pass it any options that fit your needs.
 * When your component renders, `useWithdrawalApprovalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWithdrawalApprovalQuery({
 *   variables: {
 *      withdrawalId: // value for 'withdrawalId'
 *   },
 * });
 */
export function useWithdrawalApprovalQuery(baseOptions: Apollo.QueryHookOptions<WithdrawalApprovalQuery, WithdrawalApprovalQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WithdrawalApprovalQuery, WithdrawalApprovalQueryVariables>(WithdrawalApprovalDocument, options);
      }
export function useWithdrawalApprovalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WithdrawalApprovalQuery, WithdrawalApprovalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WithdrawalApprovalQuery, WithdrawalApprovalQueryVariables>(WithdrawalApprovalDocument, options);
        }
export type WithdrawalApprovalQueryHookResult = ReturnType<typeof useWithdrawalApprovalQuery>;
export type WithdrawalApprovalLazyQueryHookResult = ReturnType<typeof useWithdrawalApprovalLazyQuery>;
export type WithdrawalApprovalQueryResult = Apollo.QueryResult<WithdrawalApprovalQuery, WithdrawalApprovalQueryVariables>;