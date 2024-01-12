import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerProposalStatusQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ExplorerProposalStatusQuery = { __typename?: 'Query', proposal?: { __typename?: 'BatchProposal' } | { __typename?: 'Proposal', id?: string | null, state: Types.ProposalState, rejectionReason?: Types.ProposalRejectionReason | null } | null };


export const ExplorerProposalStatusDocument = gql`
    query ExplorerProposalStatus($id: ID!) {
  proposal(id: $id) {
    ... on Proposal {
      id
      state
      rejectionReason
    }
  }
}
    `;

/**
 * __useExplorerProposalStatusQuery__
 *
 * To run a query within a React component, call `useExplorerProposalStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerProposalStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerProposalStatusQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExplorerProposalStatusQuery(baseOptions: Apollo.QueryHookOptions<ExplorerProposalStatusQuery, ExplorerProposalStatusQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerProposalStatusQuery, ExplorerProposalStatusQueryVariables>(ExplorerProposalStatusDocument, options);
      }
export function useExplorerProposalStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerProposalStatusQuery, ExplorerProposalStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerProposalStatusQuery, ExplorerProposalStatusQueryVariables>(ExplorerProposalStatusDocument, options);
        }
export type ExplorerProposalStatusQueryHookResult = ReturnType<typeof useExplorerProposalStatusQuery>;
export type ExplorerProposalStatusLazyQueryHookResult = ReturnType<typeof useExplorerProposalStatusLazyQuery>;
export type ExplorerProposalStatusQueryResult = Apollo.QueryResult<ExplorerProposalStatusQuery, ExplorerProposalStatusQueryVariables>;