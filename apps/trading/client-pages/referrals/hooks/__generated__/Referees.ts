import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type RefereesQueryVariables = Types.Exact<{
  code: Types.Scalars['ID'];
}>;


export type RefereesQuery = { __typename?: 'Query', referralSetReferees: { __typename?: 'ReferralSetRefereeConnection', edges: Array<{ __typename?: 'ReferralSetRefereeEdge', node: { __typename?: 'ReferralSetReferee', referralSetId: string, refereeId: string, joinedAt: any, atEpoch: number } } | null> } };


export const RefereesDocument = gql`
    query Referees($code: ID!) {
  referralSetReferees(id: $code) {
    edges {
      node {
        referralSetId
        refereeId
        joinedAt
        atEpoch
      }
    }
  }
}
    `;

/**
 * __useRefereesQuery__
 *
 * To run a query within a React component, call `useRefereesQuery` and pass it any options that fit your needs.
 * When your component renders, `useRefereesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRefereesQuery({
 *   variables: {
 *      code: // value for 'code'
 *   },
 * });
 */
export function useRefereesQuery(baseOptions: Apollo.QueryHookOptions<RefereesQuery, RefereesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RefereesQuery, RefereesQueryVariables>(RefereesDocument, options);
      }
export function useRefereesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RefereesQuery, RefereesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RefereesQuery, RefereesQueryVariables>(RefereesDocument, options);
        }
export type RefereesQueryHookResult = ReturnType<typeof useRefereesQuery>;
export type RefereesLazyQueryHookResult = ReturnType<typeof useRefereesLazyQuery>;
export type RefereesQueryResult = Apollo.QueryResult<RefereesQuery, RefereesQueryVariables>;