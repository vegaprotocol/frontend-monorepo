import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerNodeVoteQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ExplorerNodeVoteQuery = { __typename: 'Query', withdrawal?: { __typename: 'Withdrawal', id: string, status: Types.WithdrawalStatus, createdTimestamp: any, withdrawnTimestamp?: any | null, txHash?: string | null, asset: { __typename: 'Asset', id: string, name: string, decimals: number }, party: { __typename: 'Party', id: string } } | null, deposit?: { __typename: 'Deposit', id: string, status: Types.DepositStatus, createdTimestamp: any, creditedTimestamp?: any | null, txHash?: string | null, asset: { __typename: 'Asset', id: string, name: string, decimals: number }, party: { __typename: 'Party', id: string } } | null };


export const ExplorerNodeVoteDocument = gql`
    query ExplorerNodeVote($id: ID!) {
  withdrawal(id: $id) {
    id
    status
    createdTimestamp
    withdrawnTimestamp
    txHash
    asset {
      id
      name
      decimals
    }
    party {
      id
    }
  }
  deposit(id: $id) {
    id
    status
    createdTimestamp
    creditedTimestamp
    txHash
    asset {
      id
      name
      decimals
    }
    party {
      id
    }
  }
}
    `;

/**
 * __useExplorerNodeVoteQuery__
 *
 * To run a query within a React component, call `useExplorerNodeVoteQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerNodeVoteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerNodeVoteQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExplorerNodeVoteQuery(baseOptions: Apollo.QueryHookOptions<ExplorerNodeVoteQuery, ExplorerNodeVoteQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerNodeVoteQuery, ExplorerNodeVoteQueryVariables>(ExplorerNodeVoteDocument, options);
      }
export function useExplorerNodeVoteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerNodeVoteQuery, ExplorerNodeVoteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerNodeVoteQuery, ExplorerNodeVoteQueryVariables>(ExplorerNodeVoteDocument, options);
        }
export type ExplorerNodeVoteQueryHookResult = ReturnType<typeof useExplorerNodeVoteQuery>;
export type ExplorerNodeVoteLazyQueryHookResult = ReturnType<typeof useExplorerNodeVoteLazyQuery>;
export type ExplorerNodeVoteQueryResult = Apollo.QueryResult<ExplorerNodeVoteQuery, ExplorerNodeVoteQueryVariables>;