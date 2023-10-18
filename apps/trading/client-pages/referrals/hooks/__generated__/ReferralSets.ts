import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ReferralSetsQueryVariables = Types.Exact<{
  id?: Types.InputMaybe<Types.Scalars['ID']>;
  referrer?: Types.InputMaybe<Types.Scalars['ID']>;
  referee?: Types.InputMaybe<Types.Scalars['ID']>;
}>;


export type ReferralSetsQuery = { __typename?: 'Query', referralSets: { __typename?: 'ReferralSetConnection', edges: Array<{ __typename?: 'ReferralSetEdge', node: { __typename?: 'ReferralSet', id: string, referrer: string, createdAt: any, updatedAt: any } } | null> } };


export const ReferralSetsDocument = gql`
    query ReferralSets($id: ID, $referrer: ID, $referee: ID) {
  referralSets(id: $id, referrer: $referrer, referee: $referee) {
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
 * __useReferralSetsQuery__
 *
 * To run a query within a React component, call `useReferralSetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useReferralSetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useReferralSetsQuery({
 *   variables: {
 *      id: // value for 'id'
 *      referrer: // value for 'referrer'
 *      referee: // value for 'referee'
 *   },
 * });
 */
export function useReferralSetsQuery(baseOptions?: Apollo.QueryHookOptions<ReferralSetsQuery, ReferralSetsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ReferralSetsQuery, ReferralSetsQueryVariables>(ReferralSetsDocument, options);
      }
export function useReferralSetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ReferralSetsQuery, ReferralSetsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ReferralSetsQuery, ReferralSetsQueryVariables>(ReferralSetsDocument, options);
        }
export type ReferralSetsQueryHookResult = ReturnType<typeof useReferralSetsQuery>;
export type ReferralSetsLazyQueryHookResult = ReturnType<typeof useReferralSetsLazyQuery>;
export type ReferralSetsQueryResult = Apollo.QueryResult<ReferralSetsQuery, ReferralSetsQueryVariables>;