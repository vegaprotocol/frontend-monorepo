import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TeamsQueryVariables = Types.Exact<{
  teamId?: Types.InputMaybe<Types.Scalars['ID']>;
  partyId?: Types.InputMaybe<Types.Scalars['ID']>;
}>;


export type TeamsQuery = { __typename?: 'Query', teams?: { __typename?: 'TeamConnection', edges: Array<{ __typename?: 'TeamEdge', node: { __typename?: 'Team', teamId: string, referrer: string, name: string, teamUrl: string, avatarUrl: string, createdAt: any, createdAtEpoch: number, closed: boolean } }> } | null };


export const TeamsDocument = gql`
    query Teams($teamId: ID, $partyId: ID) {
  teams(teamId: $teamId, partyId: $partyId) {
    edges {
      node {
        teamId
        referrer
        name
        teamUrl
        avatarUrl
        createdAt
        createdAtEpoch
        closed
      }
    }
  }
}
    `;

/**
 * __useTeamsQuery__
 *
 * To run a query within a React component, call `useTeamsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTeamsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTeamsQuery({
 *   variables: {
 *      teamId: // value for 'teamId'
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useTeamsQuery(baseOptions?: Apollo.QueryHookOptions<TeamsQuery, TeamsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TeamsQuery, TeamsQueryVariables>(TeamsDocument, options);
      }
export function useTeamsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TeamsQuery, TeamsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TeamsQuery, TeamsQueryVariables>(TeamsDocument, options);
        }
export type TeamsQueryHookResult = ReturnType<typeof useTeamsQuery>;
export type TeamsLazyQueryHookResult = ReturnType<typeof useTeamsLazyQuery>;
export type TeamsQueryResult = Apollo.QueryResult<TeamsQuery, TeamsQueryVariables>;