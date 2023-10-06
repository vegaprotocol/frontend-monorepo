import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type RefereeQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type RefereeQuery = { __typename?: 'Query', referralSets: { __typename?: 'ReferralSetConnection', edges: Array<{ __typename?: 'ReferralSetEdge', node: { __typename?: 'ReferralSet', id: string, referrer: string, createdAt: any, updatedAt: any } } | null> } };


export const RefereeDocument = gql`
    query Referee($partyId: ID!) {
  referralSets(referee: $partyId) {
    edges {
      node {
        id
        referrer
        createdAt
        updatedAt
      }
    }
  }
}
    `;

/**
 * __useRefereeQuery__
 *
 * To run a query within a React component, call `useRefereeQuery` and pass it any options that fit your needs.
 * When your component renders, `useRefereeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRefereeQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useRefereeQuery(baseOptions: Apollo.QueryHookOptions<RefereeQuery, RefereeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RefereeQuery, RefereeQueryVariables>(RefereeDocument, options);
      }
export function useRefereeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RefereeQuery, RefereeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RefereeQuery, RefereeQueryVariables>(RefereeDocument, options);
        }
export type RefereeQueryHookResult = ReturnType<typeof useRefereeQuery>;
export type RefereeLazyQueryHookResult = ReturnType<typeof useRefereeLazyQuery>;
export type RefereeQueryResult = Apollo.QueryResult<RefereeQuery, RefereeQueryVariables>;