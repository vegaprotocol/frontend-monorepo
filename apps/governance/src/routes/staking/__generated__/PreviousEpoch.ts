import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PreviousEpochQueryVariables = Types.Exact<{
  epochId?: Types.InputMaybe<Types.Scalars['ID']>;
}>;


export type PreviousEpochQuery = { __typename: 'Query', epoch: { __typename: 'Epoch', id: string, validatorsConnection?: { __typename: 'NodesConnection', edges?: Array<{ __typename: 'NodeEdge', node: { __typename: 'Node', id: string, stakedTotal: string, rewardScore?: { __typename: 'RewardScore', rawValidatorScore: string, performanceScore: string, multisigScore: string, validatorScore: string, normalisedScore: string, validatorStatus: Types.ValidatorStatus } | null, rankingScore: { __typename: 'RankingScore', status: Types.ValidatorStatus, previousStatus: Types.ValidatorStatus, rankingScore: string, stakeScore: string, performanceScore: string, votingPower: string } } } | null> | null } | null } };


export const PreviousEpochDocument = gql`
    query PreviousEpoch($epochId: ID) {
  epoch(id: $epochId) {
    id
    validatorsConnection {
      edges {
        node {
          id
          stakedTotal
          rewardScore {
            rawValidatorScore
            performanceScore
            multisigScore
            validatorScore
            normalisedScore
            validatorStatus
          }
          rankingScore {
            status
            previousStatus
            rankingScore
            stakeScore
            performanceScore
            votingPower
          }
        }
      }
    }
  }
}
    `;

/**
 * __usePreviousEpochQuery__
 *
 * To run a query within a React component, call `usePreviousEpochQuery` and pass it any options that fit your needs.
 * When your component renders, `usePreviousEpochQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePreviousEpochQuery({
 *   variables: {
 *      epochId: // value for 'epochId'
 *   },
 * });
 */
export function usePreviousEpochQuery(baseOptions?: Apollo.QueryHookOptions<PreviousEpochQuery, PreviousEpochQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PreviousEpochQuery, PreviousEpochQueryVariables>(PreviousEpochDocument, options);
      }
export function usePreviousEpochLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PreviousEpochQuery, PreviousEpochQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PreviousEpochQuery, PreviousEpochQueryVariables>(PreviousEpochDocument, options);
        }
export type PreviousEpochQueryHookResult = ReturnType<typeof usePreviousEpochQuery>;
export type PreviousEpochLazyQueryHookResult = ReturnType<typeof usePreviousEpochLazyQuery>;
export type PreviousEpochQueryResult = Apollo.QueryResult<PreviousEpochQuery, PreviousEpochQueryVariables>;