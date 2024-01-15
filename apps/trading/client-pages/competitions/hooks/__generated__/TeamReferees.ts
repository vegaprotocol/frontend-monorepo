import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TeamRefereesQueryVariables = Types.Exact<{
  teamId: Types.Scalars['ID'];
}>;


export type TeamRefereesQuery = { __typename?: 'Query', teamReferees?: { __typename?: 'TeamRefereeConnection', edges: Array<{ __typename?: 'TeamRefereeEdge', node: { __typename?: 'TeamReferee', teamId: string, referee: string, joinedAt: any, joinedAtEpoch: number } }> } | null };


export const TeamRefereesDocument = gql`
    query TeamReferees($teamId: ID!) {
  teamReferees(teamId: $teamId) {
    edges {
      node {
        teamId
        referee
        joinedAt
        joinedAtEpoch
      }
    }
  }
}
    `;

/**
 * __useTeamRefereesQuery__
 *
 * To run a query within a React component, call `useTeamRefereesQuery` and pass it any options that fit your needs.
 * When your component renders, `useTeamRefereesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTeamRefereesQuery({
 *   variables: {
 *      teamId: // value for 'teamId'
 *   },
 * });
 */
export function useTeamRefereesQuery(baseOptions: Apollo.QueryHookOptions<TeamRefereesQuery, TeamRefereesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TeamRefereesQuery, TeamRefereesQueryVariables>(TeamRefereesDocument, options);
      }
export function useTeamRefereesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TeamRefereesQuery, TeamRefereesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TeamRefereesQuery, TeamRefereesQueryVariables>(TeamRefereesDocument, options);
        }
export type TeamRefereesQueryHookResult = ReturnType<typeof useTeamRefereesQuery>;
export type TeamRefereesLazyQueryHookResult = ReturnType<typeof useTeamRefereesLazyQuery>;
export type TeamRefereesQueryResult = Apollo.QueryResult<TeamRefereesQuery, TeamRefereesQueryVariables>;