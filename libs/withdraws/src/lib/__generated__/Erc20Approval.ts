import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type Erc20ApprovalQueryVariables = Types.Exact<{
  withdrawalId: Types.Scalars['ID'];
}>;


export type Erc20ApprovalQuery = { __typename: 'Query', erc20WithdrawalApproval?: { __typename: 'Erc20WithdrawalApproval', assetSource: string, amount: string, nonce: string, signatures: string, targetAddress: string, creation: string } | null };


export const Erc20ApprovalDocument = gql`
    query Erc20Approval($withdrawalId: ID!) {
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
 * __useErc20ApprovalQuery__
 *
 * To run a query within a React component, call `useErc20ApprovalQuery` and pass it any options that fit your needs.
 * When your component renders, `useErc20ApprovalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useErc20ApprovalQuery({
 *   variables: {
 *      withdrawalId: // value for 'withdrawalId'
 *   },
 * });
 */
export function useErc20ApprovalQuery(baseOptions: Apollo.QueryHookOptions<Erc20ApprovalQuery, Erc20ApprovalQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Erc20ApprovalQuery, Erc20ApprovalQueryVariables>(Erc20ApprovalDocument, options);
      }
export function useErc20ApprovalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Erc20ApprovalQuery, Erc20ApprovalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Erc20ApprovalQuery, Erc20ApprovalQueryVariables>(Erc20ApprovalDocument, options);
        }
export type Erc20ApprovalQueryHookResult = ReturnType<typeof useErc20ApprovalQuery>;
export type Erc20ApprovalLazyQueryHookResult = ReturnType<typeof useErc20ApprovalLazyQuery>;
export type Erc20ApprovalQueryResult = Apollo.QueryResult<Erc20ApprovalQuery, Erc20ApprovalQueryVariables>;