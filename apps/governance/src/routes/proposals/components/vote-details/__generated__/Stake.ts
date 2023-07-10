import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type VoteButtonsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type VoteButtonsQuery = { __typename: 'Query', party?: { __typename: 'Party', id: string, stakingSummary: { __typename: 'StakingSummary', currentStakeAvailable: string } } | null };


export const VoteButtonsDocument = gql`
    query VoteButtons($partyId: ID!) {
  party(id: $partyId) {
    id
    stakingSummary {
      currentStakeAvailable
    }
  }
}
    `;

/**
 * __useVoteButtonsQuery__
 *
 * To run a query within a React component, call `useVoteButtonsQuery` and pass it any options that fit your needs.
 * When your component renders, `useVoteButtonsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVoteButtonsQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useVoteButtonsQuery(baseOptions: Apollo.QueryHookOptions<VoteButtonsQuery, VoteButtonsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<VoteButtonsQuery, VoteButtonsQueryVariables>(VoteButtonsDocument, options);
      }
export function useVoteButtonsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<VoteButtonsQuery, VoteButtonsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<VoteButtonsQuery, VoteButtonsQueryVariables>(VoteButtonsDocument, options);
        }
export type VoteButtonsQueryHookResult = ReturnType<typeof useVoteButtonsQuery>;
export type VoteButtonsLazyQueryHookResult = ReturnType<typeof useVoteButtonsLazyQuery>;
export type VoteButtonsQueryResult = Apollo.QueryResult<VoteButtonsQuery, VoteButtonsQueryVariables>;