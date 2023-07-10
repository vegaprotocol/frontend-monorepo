import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UserVoteQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type UserVoteQuery = { __typename: 'Query', party?: { __typename: 'Party', votesConnection?: { __typename: 'ProposalVoteConnection', edges?: Array<{ __typename: 'ProposalVoteEdge', node: { __typename: 'ProposalVote', proposalId: string, vote: { __typename: 'Vote', value: Types.VoteValue, datetime: any } } }> | null } | null } | null };


export const UserVoteDocument = gql`
    query UserVote($partyId: ID!) {
  party(id: $partyId) {
    votesConnection {
      edges {
        node {
          proposalId
          vote {
            value
            datetime
          }
        }
      }
    }
  }
}
    `;

/**
 * __useUserVoteQuery__
 *
 * To run a query within a React component, call `useUserVoteQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserVoteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserVoteQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useUserVoteQuery(baseOptions: Apollo.QueryHookOptions<UserVoteQuery, UserVoteQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UserVoteQuery, UserVoteQueryVariables>(UserVoteDocument, options);
      }
export function useUserVoteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserVoteQuery, UserVoteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UserVoteQuery, UserVoteQueryVariables>(UserVoteDocument, options);
        }
export type UserVoteQueryHookResult = ReturnType<typeof useUserVoteQuery>;
export type UserVoteLazyQueryHookResult = ReturnType<typeof useUserVoteLazyQuery>;
export type UserVoteQueryResult = Apollo.QueryResult<UserVoteQuery, UserVoteQueryVariables>;