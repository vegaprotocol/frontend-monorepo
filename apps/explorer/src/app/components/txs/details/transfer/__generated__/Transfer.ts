import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerTransferVoteQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ExplorerTransferVoteQuery = { __typename?: 'Query', transfer?: { __typename?: 'Transfer', reference?: string | null, timestamp: any, status: Types.TransferStatus, reason?: string | null, fromAccountType: Types.AccountType, from: string, to: string, toAccountType: Types.AccountType, amount: string, asset?: { __typename?: 'Asset', id: string } | null } | null };


export const ExplorerTransferVoteDocument = gql`
    query ExplorerTransferVote($id: ID!) {
  transfer(id: $id) {
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
    `;

/**
 * __useExplorerTransferVoteQuery__
 *
 * To run a query within a React component, call `useExplorerTransferVoteQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerTransferVoteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerTransferVoteQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExplorerTransferVoteQuery(baseOptions: Apollo.QueryHookOptions<ExplorerTransferVoteQuery, ExplorerTransferVoteQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerTransferVoteQuery, ExplorerTransferVoteQueryVariables>(ExplorerTransferVoteDocument, options);
      }
export function useExplorerTransferVoteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerTransferVoteQuery, ExplorerTransferVoteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerTransferVoteQuery, ExplorerTransferVoteQueryVariables>(ExplorerTransferVoteDocument, options);
        }
export type ExplorerTransferVoteQueryHookResult = ReturnType<typeof useExplorerTransferVoteQuery>;
export type ExplorerTransferVoteLazyQueryHookResult = ReturnType<typeof useExplorerTransferVoteLazyQuery>;
export type ExplorerTransferVoteQueryResult = Apollo.QueryResult<ExplorerTransferVoteQuery, ExplorerTransferVoteQueryVariables>;