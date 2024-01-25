import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TeamsStatisticsQueryVariables = Types.Exact<{
  teamId?: Types.InputMaybe<Types.Scalars['ID']>;
  aggregationEpochs?: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type TeamsStatisticsQuery = { __typename?: 'Query', teamsStatistics?: { __typename?: 'TeamsStatisticsConnection', edges: Array<{ __typename?: 'TeamStatisticsEdge', node: { __typename?: 'TeamStatistics', teamId: string, totalQuantumVolume: string, totalQuantumRewards: string, totalGamesPlayed: number, gamesPlayed: Array<string> } }> } | null };


export const TeamsStatisticsDocument = gql`
    query TeamsStatistics($teamId: ID, $aggregationEpochs: Int) {
  teamsStatistics(teamId: $teamId, aggregationEpochs: $aggregationEpochs) {
    edges {
      node {
        teamId
        totalQuantumVolume
        totalQuantumRewards
        totalGamesPlayed
        gamesPlayed
      }
    }
  }
}
    `;

/**
 * __useTeamsStatisticsQuery__
 *
 * To run a query within a React component, call `useTeamsStatisticsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTeamsStatisticsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTeamsStatisticsQuery({
 *   variables: {
 *      teamId: // value for 'teamId'
 *      aggregationEpochs: // value for 'aggregationEpochs'
 *   },
 * });
 */
export function useTeamsStatisticsQuery(baseOptions?: Apollo.QueryHookOptions<TeamsStatisticsQuery, TeamsStatisticsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TeamsStatisticsQuery, TeamsStatisticsQueryVariables>(TeamsStatisticsDocument, options);
      }
export function useTeamsStatisticsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TeamsStatisticsQuery, TeamsStatisticsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TeamsStatisticsQuery, TeamsStatisticsQueryVariables>(TeamsStatisticsDocument, options);
        }
export type TeamsStatisticsQueryHookResult = ReturnType<typeof useTeamsStatisticsQuery>;
export type TeamsStatisticsLazyQueryHookResult = ReturnType<typeof useTeamsStatisticsLazyQuery>;
export type TeamsStatisticsQueryResult = Apollo.QueryResult<TeamsStatisticsQuery, TeamsStatisticsQueryVariables>;