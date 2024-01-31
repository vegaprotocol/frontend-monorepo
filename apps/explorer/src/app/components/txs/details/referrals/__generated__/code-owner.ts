import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerReferralCodeOwnerQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ExplorerReferralCodeOwnerQuery = { __typename?: 'Query', referralSets: { __typename?: 'ReferralSetConnection', edges: Array<{ __typename?: 'ReferralSetEdge', node: { __typename?: 'ReferralSet', createdAt: any, updatedAt: any, referrer: string } } | null> } };


export const ExplorerReferralCodeOwnerDocument = gql`
    query ExplorerReferralCodeOwner($id: ID!) {
  referralSets(id: $id) {
    edges {
      node {
        createdAt
        updatedAt
        referrer
      }
    }
  }
}
    `;

/**
 * __useExplorerReferralCodeOwnerQuery__
 *
 * To run a query within a React component, call `useExplorerReferralCodeOwnerQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerReferralCodeOwnerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerReferralCodeOwnerQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExplorerReferralCodeOwnerQuery(baseOptions: Apollo.QueryHookOptions<ExplorerReferralCodeOwnerQuery, ExplorerReferralCodeOwnerQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerReferralCodeOwnerQuery, ExplorerReferralCodeOwnerQueryVariables>(ExplorerReferralCodeOwnerDocument, options);
      }
export function useExplorerReferralCodeOwnerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerReferralCodeOwnerQuery, ExplorerReferralCodeOwnerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerReferralCodeOwnerQuery, ExplorerReferralCodeOwnerQueryVariables>(ExplorerReferralCodeOwnerDocument, options);
        }
export type ExplorerReferralCodeOwnerQueryHookResult = ReturnType<typeof useExplorerReferralCodeOwnerQuery>;
export type ExplorerReferralCodeOwnerLazyQueryHookResult = ReturnType<typeof useExplorerReferralCodeOwnerLazyQuery>;
export type ExplorerReferralCodeOwnerQueryResult = Apollo.QueryResult<ExplorerReferralCodeOwnerQuery, ExplorerReferralCodeOwnerQueryVariables>;