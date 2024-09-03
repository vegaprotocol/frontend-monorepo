import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TeamScoreFieldsFragment = { __typename?: 'GameTeamScore', gameId: string, teamId: string, epochId: number, time: any, score: string };

export type PartyScoreFieldsFragment = { __typename?: 'GamePartyScore', gameId: string, teamId?: string | null, epochId: number, partyId: string, time: any, score: string, stakingBalance?: string | null, openVolume?: string | null, totalFeesPaid: string, isEligible: boolean, rank?: number | null };

export type ScoresQueryVariables = Types.Exact<{
  gameId: Types.Scalars['ID'];
  partyId: Types.Scalars['ID'];
  epochFrom?: Types.InputMaybe<Types.Scalars['Int']>;
  epochTo?: Types.InputMaybe<Types.Scalars['Int']>;
  pagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type ScoresQuery = { __typename?: 'Query', gameTeamScores?: { __typename?: 'GameTeamScoreConnection', edges?: Array<{ __typename?: 'GameTeamScoreEdge', cursor?: string | null, node?: { __typename?: 'GameTeamScore', gameId: string, teamId: string, epochId: number, time: any, score: string } | null }> | null } | null, gamePartyScores?: { __typename?: 'GamePartyScoreConnection', edges?: Array<{ __typename?: 'GamePartyScoreEdge', cursor?: string | null, node?: { __typename?: 'GamePartyScore', gameId: string, teamId?: string | null, epochId: number, partyId: string, time: any, score: string, stakingBalance?: string | null, openVolume?: string | null, totalFeesPaid: string, isEligible: boolean, rank?: number | null } | null }> | null } | null };

export const TeamScoreFieldsFragmentDoc = gql`
    fragment TeamScoreFields on GameTeamScore {
  gameId
  teamId
  epochId
  time
  score
}
    `;
export const PartyScoreFieldsFragmentDoc = gql`
    fragment PartyScoreFields on GamePartyScore {
  gameId
  teamId
  epochId
  partyId
  time
  score
  stakingBalance
  openVolume
  totalFeesPaid
  isEligible
  rank
}
    `;
export const ScoresDocument = gql`
    query Scores($gameId: ID!, $partyId: ID!, $epochFrom: Int, $epochTo: Int, $pagination: Pagination) {
  gameTeamScores(
    filter: {gameIds: [$gameId], epochFrom: $epochFrom, epochTo: $epochTo}
    pagination: $pagination
  ) {
    edges {
      cursor
      node {
        ...TeamScoreFields
      }
    }
  }
  gamePartyScores(
    filter: {gameIds: [$gameId], partyIds: [$partyId], epochFrom: $epochFrom, epochTo: $epochTo}
    pagination: $pagination
  ) {
    edges {
      cursor
      node {
        ...PartyScoreFields
      }
    }
  }
}
    ${TeamScoreFieldsFragmentDoc}
${PartyScoreFieldsFragmentDoc}`;

/**
 * __useScoresQuery__
 *
 * To run a query within a React component, call `useScoresQuery` and pass it any options that fit your needs.
 * When your component renders, `useScoresQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useScoresQuery({
 *   variables: {
 *      gameId: // value for 'gameId'
 *      partyId: // value for 'partyId'
 *      epochFrom: // value for 'epochFrom'
 *      epochTo: // value for 'epochTo'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useScoresQuery(baseOptions: Apollo.QueryHookOptions<ScoresQuery, ScoresQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ScoresQuery, ScoresQueryVariables>(ScoresDocument, options);
      }
export function useScoresLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ScoresQuery, ScoresQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ScoresQuery, ScoresQueryVariables>(ScoresDocument, options);
        }
export type ScoresQueryHookResult = ReturnType<typeof useScoresQuery>;
export type ScoresLazyQueryHookResult = ReturnType<typeof useScoresLazyQuery>;
export type ScoresQueryResult = Apollo.QueryResult<ScoresQuery, ScoresQueryVariables>;