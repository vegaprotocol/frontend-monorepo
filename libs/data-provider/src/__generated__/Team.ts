import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TeamFieldsFragment = { __typename?: 'Team', teamId: string, referrer: string, name: string, teamUrl: string, avatarUrl: string, createdAt: any, createdAtEpoch: number, closed: boolean, allowList: Array<string> };

export type TeamStatsFieldsFragment = { __typename?: 'TeamStatistics', teamId: string, totalQuantumVolume: string, totalQuantumRewards: string, totalGamesPlayed: number, gamesPlayed: Array<string>, quantumRewards: Array<{ __typename?: 'QuantumRewardsPerEpoch', epoch: number, totalQuantumRewards: string }> };

export type TeamRefereeFieldsFragment = { __typename?: 'TeamReferee', teamId: string, referee: string, joinedAt: any, joinedAtEpoch: number };

export type TeamMemberStatsFieldsFragment = { __typename?: 'TeamMemberStatistics', partyId: string, totalQuantumVolume: string, totalQuantumRewards: string, totalGamesPlayed: number };

export type TeamQueryVariables = Types.Exact<{
  teamId: Types.Scalars['ID'];
  partyId?: Types.InputMaybe<Types.Scalars['ID']>;
  aggregationEpochs?: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type TeamQuery = { __typename?: 'Query', teams?: { __typename?: 'TeamConnection', edges: Array<{ __typename?: 'TeamEdge', node: { __typename?: 'Team', teamId: string, referrer: string, name: string, teamUrl: string, avatarUrl: string, createdAt: any, createdAtEpoch: number, closed: boolean, allowList: Array<string> } }> } | null, partyTeams?: { __typename?: 'TeamConnection', edges: Array<{ __typename?: 'TeamEdge', node: { __typename?: 'Team', teamId: string, referrer: string, name: string, teamUrl: string, avatarUrl: string, createdAt: any, createdAtEpoch: number, closed: boolean, allowList: Array<string> } }> } | null, teamsStatistics?: { __typename?: 'TeamsStatisticsConnection', edges: Array<{ __typename?: 'TeamStatisticsEdge', node: { __typename?: 'TeamStatistics', teamId: string, totalQuantumVolume: string, totalQuantumRewards: string, totalGamesPlayed: number, gamesPlayed: Array<string>, quantumRewards: Array<{ __typename?: 'QuantumRewardsPerEpoch', epoch: number, totalQuantumRewards: string }> } }> } | null, teamReferees?: { __typename?: 'TeamRefereeConnection', edges: Array<{ __typename?: 'TeamRefereeEdge', node: { __typename?: 'TeamReferee', teamId: string, referee: string, joinedAt: any, joinedAtEpoch: number } }> } | null, teamMembersStatistics?: { __typename?: 'TeamMembersStatisticsConnection', edges: Array<{ __typename?: 'TeamMemberStatisticsEdge', node: { __typename?: 'TeamMemberStatistics', partyId: string, totalQuantumVolume: string, totalQuantumRewards: string, totalGamesPlayed: number } }> } | null };

export const TeamFieldsFragmentDoc = gql`
    fragment TeamFields on Team {
  teamId
  referrer
  name
  teamUrl
  avatarUrl
  createdAt
  createdAtEpoch
  closed
  allowList
}
    `;
export const TeamStatsFieldsFragmentDoc = gql`
    fragment TeamStatsFields on TeamStatistics {
  teamId
  totalQuantumVolume
  totalQuantumRewards
  totalGamesPlayed
  quantumRewards {
    epoch
    totalQuantumRewards
  }
  gamesPlayed
}
    `;
export const TeamRefereeFieldsFragmentDoc = gql`
    fragment TeamRefereeFields on TeamReferee {
  teamId
  referee
  joinedAt
  joinedAtEpoch
}
    `;
export const TeamMemberStatsFieldsFragmentDoc = gql`
    fragment TeamMemberStatsFields on TeamMemberStatistics {
  partyId
  totalQuantumVolume
  totalQuantumRewards
  totalGamesPlayed
}
    `;
export const TeamDocument = gql`
    query Team($teamId: ID!, $partyId: ID, $aggregationEpochs: Int) {
  teams(teamId: $teamId) {
    edges {
      node {
        ...TeamFields
      }
    }
  }
  partyTeams: teams(partyId: $partyId) {
    edges {
      node {
        ...TeamFields
      }
    }
  }
  teamsStatistics(teamId: $teamId, aggregationEpochs: $aggregationEpochs) {
    edges {
      node {
        ...TeamStatsFields
      }
    }
  }
  teamReferees(teamId: $teamId) {
    edges {
      node {
        ...TeamRefereeFields
      }
    }
  }
  teamMembersStatistics(teamId: $teamId, aggregationEpochs: $aggregationEpochs) {
    edges {
      node {
        ...TeamMemberStatsFields
      }
    }
  }
}
    ${TeamFieldsFragmentDoc}
${TeamStatsFieldsFragmentDoc}
${TeamRefereeFieldsFragmentDoc}
${TeamMemberStatsFieldsFragmentDoc}`;

/**
 * __useTeamQuery__
 *
 * To run a query within a React component, call `useTeamQuery` and pass it any options that fit your needs.
 * When your component renders, `useTeamQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTeamQuery({
 *   variables: {
 *      teamId: // value for 'teamId'
 *      partyId: // value for 'partyId'
 *      aggregationEpochs: // value for 'aggregationEpochs'
 *   },
 * });
 */
export function useTeamQuery(baseOptions: Apollo.QueryHookOptions<TeamQuery, TeamQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TeamQuery, TeamQueryVariables>(TeamDocument, options);
      }
export function useTeamLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TeamQuery, TeamQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TeamQuery, TeamQueryVariables>(TeamDocument, options);
        }
export type TeamQueryHookResult = ReturnType<typeof useTeamQuery>;
export type TeamLazyQueryHookResult = ReturnType<typeof useTeamLazyQuery>;
export type TeamQueryResult = Apollo.QueryResult<TeamQuery, TeamQueryVariables>;