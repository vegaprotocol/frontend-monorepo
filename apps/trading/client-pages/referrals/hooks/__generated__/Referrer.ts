import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ReferrerQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type ReferrerQuery = { __typename?: 'Query', referralSets: { __typename?: 'ReferralSetConnection', edges: Array<{ __typename?: 'ReferralSetEdge', node: { __typename?: 'ReferralSet', id: string, referrer: string, createdAt: any, updatedAt: any } } | null> } };


export const ReferrerDocument = gql`
    query Referrer($partyId: ID!) {
  referralSets(referrer: $partyId) {
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
 * __useReferrerQuery__
 *
 * To run a query within a React component, call `useReferrerQuery` and pass it any options that fit your needs.
 * When your component renders, `useReferrerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useReferrerQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useReferrerQuery(baseOptions: Apollo.QueryHookOptions<ReferrerQuery, ReferrerQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ReferrerQuery, ReferrerQueryVariables>(ReferrerDocument, options);
      }
export function useReferrerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ReferrerQuery, ReferrerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ReferrerQuery, ReferrerQueryVariables>(ReferrerDocument, options);
        }
export type ReferrerQueryHookResult = ReturnType<typeof useReferrerQuery>;
export type ReferrerLazyQueryHookResult = ReturnType<typeof useReferrerLazyQuery>;
export type ReferrerQueryResult = Apollo.QueryResult<ReferrerQuery, ReferrerQueryVariables>;