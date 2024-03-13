import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerTransferStatusQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ExplorerTransferStatusQuery = { __typename?: 'Query', transfer?: { __typename?: 'TransferNode', fees?: Array<{ __typename?: 'TransferFee', amount: string, epoch: number } | null> | null, transfer: { __typename?: 'Transfer', reference?: string | null, timestamp: any, status: Types.TransferStatus, reason?: string | null, fromAccountType: Types.AccountType, from: string, to: string, toAccountType: Types.AccountType, amount: string, asset?: { __typename?: 'Asset', id: string } | null } } | null };


export const ExplorerTransferStatusDocument = gql`
    query ExplorerTransferStatus($id: ID!) {
  transfer(id: $id) {
    fees {
      amount
      epoch
    }
    transfer {
      reference
      timestamp
      status
      reason
      fromAccountType
      from
      to
      toAccountType
      asset {
        id
      }
      amount
    }
  }
}
    `;

/**
 * __useExplorerTransferStatusQuery__
 *
 * To run a query within a React component, call `useExplorerTransferStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerTransferStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerTransferStatusQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExplorerTransferStatusQuery(baseOptions: Apollo.QueryHookOptions<ExplorerTransferStatusQuery, ExplorerTransferStatusQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerTransferStatusQuery, ExplorerTransferStatusQueryVariables>(ExplorerTransferStatusDocument, options);
      }
export function useExplorerTransferStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerTransferStatusQuery, ExplorerTransferStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerTransferStatusQuery, ExplorerTransferStatusQueryVariables>(ExplorerTransferStatusDocument, options);
        }
export type ExplorerTransferStatusQueryHookResult = ReturnType<typeof useExplorerTransferStatusQuery>;
export type ExplorerTransferStatusLazyQueryHookResult = ReturnType<typeof useExplorerTransferStatusLazyQuery>;
export type ExplorerTransferStatusQueryResult = Apollo.QueryResult<ExplorerTransferStatusQuery, ExplorerTransferStatusQueryVariables>;