import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type StakeAvailableQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type StakeAvailableQuery = { __typename?: 'Query', party?: { __typename?: 'Party', stakingSummary: { __typename?: 'StakingSummary', currentStakeAvailable: string } } | null, networkParameter?: { __typename?: 'NetworkParameter', value: string } | null };


export const StakeAvailableDocument = gql`
    query StakeAvailable($partyId: ID!) {
  party(id: $partyId) {
    stakingSummary {
      currentStakeAvailable
    }
  }
  networkParameter(key: "referralProgram.minStakedVegaTokens") {
    value
  }
}
    `;

/**
 * __useStakeAvailableQuery__
 *
 * To run a query within a React component, call `useStakeAvailableQuery` and pass it any options that fit your needs.
 * When your component renders, `useStakeAvailableQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStakeAvailableQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useStakeAvailableQuery(baseOptions: Apollo.QueryHookOptions<StakeAvailableQuery, StakeAvailableQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<StakeAvailableQuery, StakeAvailableQueryVariables>(StakeAvailableDocument, options);
      }
export function useStakeAvailableLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<StakeAvailableQuery, StakeAvailableQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<StakeAvailableQuery, StakeAvailableQueryVariables>(StakeAvailableDocument, options);
        }
export type StakeAvailableQueryHookResult = ReturnType<typeof useStakeAvailableQuery>;
export type StakeAvailableLazyQueryHookResult = ReturnType<typeof useStakeAvailableLazyQuery>;
export type StakeAvailableQueryResult = Apollo.QueryResult<StakeAvailableQuery, StakeAvailableQueryVariables>;