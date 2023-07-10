import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerWithdrawalPropertiesFragment = { __typename: 'Withdrawal', id: string, status: Types.WithdrawalStatus, createdTimestamp: any, withdrawnTimestamp?: any | null, ref: string, txHash?: string | null, details?: { __typename: 'Erc20WithdrawalDetails', receiverAddress: string } | null };

export type ExplorerWithdrawalQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ExplorerWithdrawalQuery = { __typename: 'Query', withdrawal?: { __typename: 'Withdrawal', id: string, status: Types.WithdrawalStatus, createdTimestamp: any, withdrawnTimestamp?: any | null, ref: string, txHash?: string | null, details?: { __typename: 'Erc20WithdrawalDetails', receiverAddress: string } | null } | null };

export const ExplorerWithdrawalPropertiesFragmentDoc = gql`
    fragment ExplorerWithdrawalProperties on Withdrawal {
  id
  status
  createdTimestamp
  withdrawnTimestamp
  ref
  txHash
  details {
    ... on Erc20WithdrawalDetails {
      receiverAddress
    }
  }
}
    `;
export const ExplorerWithdrawalDocument = gql`
    query ExplorerWithdrawal($id: ID!) {
  withdrawal(id: $id) {
    ...ExplorerWithdrawalProperties
  }
}
    ${ExplorerWithdrawalPropertiesFragmentDoc}`;

/**
 * __useExplorerWithdrawalQuery__
 *
 * To run a query within a React component, call `useExplorerWithdrawalQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerWithdrawalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerWithdrawalQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExplorerWithdrawalQuery(baseOptions: Apollo.QueryHookOptions<ExplorerWithdrawalQuery, ExplorerWithdrawalQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerWithdrawalQuery, ExplorerWithdrawalQueryVariables>(ExplorerWithdrawalDocument, options);
      }
export function useExplorerWithdrawalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerWithdrawalQuery, ExplorerWithdrawalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerWithdrawalQuery, ExplorerWithdrawalQueryVariables>(ExplorerWithdrawalDocument, options);
        }
export type ExplorerWithdrawalQueryHookResult = ReturnType<typeof useExplorerWithdrawalQuery>;
export type ExplorerWithdrawalLazyQueryHookResult = ReturnType<typeof useExplorerWithdrawalLazyQuery>;
export type ExplorerWithdrawalQueryResult = Apollo.QueryResult<ExplorerWithdrawalQuery, ExplorerWithdrawalQueryVariables>;