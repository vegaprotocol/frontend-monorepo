import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TeamEntityFragment = { __typename?: 'TeamGameEntity', rank: number, volume: string, rewardMetric: Types.DispatchMetric, rewardEarned: string, totalRewardsEarned: string, team: { __typename?: 'TeamParticipation', teamId: string, membersParticipating: Array<{ __typename?: 'IndividualGameEntity', individual: string, rank: number }> } };

export type GameFieldsFragment = { __typename?: 'Game', id: string, epoch: number, numberOfParticipants: number, rewardAssetId: string, entities: Array<{ __typename?: 'IndividualGameEntity' } | { __typename?: 'TeamGameEntity', rank: number, volume: string, rewardMetric: Types.DispatchMetric, rewardEarned: string, totalRewardsEarned: string, team: { __typename?: 'TeamParticipation', teamId: string, membersParticipating: Array<{ __typename?: 'IndividualGameEntity', individual: string, rank: number }> } }> };

export type GamesQueryVariables = Types.Exact<{
  epochFrom?: Types.InputMaybe<Types.Scalars['Int']>;
  epochTo?: Types.InputMaybe<Types.Scalars['Int']>;
  teamId?: Types.InputMaybe<Types.Scalars['ID']>;
}>;


export type GamesQuery = { __typename?: 'Query', games: { __typename?: 'GamesConnection', edges?: Array<{ __typename?: 'GameEdge', node: { __typename?: 'Game', id: string, epoch: number, numberOfParticipants: number, rewardAssetId: string, entities: Array<{ __typename?: 'IndividualGameEntity' } | { __typename?: 'TeamGameEntity', rank: number, volume: string, rewardMetric: Types.DispatchMetric, rewardEarned: string, totalRewardsEarned: string, team: { __typename?: 'TeamParticipation', teamId: string, membersParticipating: Array<{ __typename?: 'IndividualGameEntity', individual: string, rank: number }> } }> } } | null> | null } };

export const TeamEntityFragmentDoc = gql`
    fragment TeamEntity on TeamGameEntity {
  rank
  volume
  rewardMetric
  rewardEarned
  totalRewardsEarned
  team {
    teamId
    membersParticipating {
      individual
      rank
    }
  }
}
    `;
export const GameFieldsFragmentDoc = gql`
    fragment GameFields on Game {
  id
  epoch
  numberOfParticipants
  rewardAssetId
  entities {
    ... on TeamGameEntity {
      ...TeamEntity
    }
  }
}
    ${TeamEntityFragmentDoc}`;
export const GamesDocument = gql`
    query Games($epochFrom: Int, $epochTo: Int, $teamId: ID) {
  games(
    epochFrom: $epochFrom
    epochTo: $epochTo
    teamId: $teamId
    entityScope: ENTITY_SCOPE_TEAMS
  ) {
    edges {
      node {
        ...GameFields
      }
    }
  }
}
    ${GameFieldsFragmentDoc}`;

/**
 * __useGamesQuery__
 *
 * To run a query within a React component, call `useGamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGamesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGamesQuery({
 *   variables: {
 *      epochFrom: // value for 'epochFrom'
 *      epochTo: // value for 'epochTo'
 *      teamId: // value for 'teamId'
 *   },
 * });
 */
export function useGamesQuery(baseOptions?: Apollo.QueryHookOptions<GamesQuery, GamesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GamesQuery, GamesQueryVariables>(GamesDocument, options);
      }
export function useGamesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GamesQuery, GamesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GamesQuery, GamesQueryVariables>(GamesDocument, options);
        }
export type GamesQueryHookResult = ReturnType<typeof useGamesQuery>;
export type GamesLazyQueryHookResult = ReturnType<typeof useGamesLazyQuery>;
export type GamesQueryResult = Apollo.QueryResult<GamesQuery, GamesQueryVariables>;