import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerProposalQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ExplorerProposalQuery = { __typename: 'Query', proposal?: { __typename: 'Proposal', id?: string | null, rationale: { __typename: 'ProposalRationale', title: string, description: string } } | null };


export const ExplorerProposalDocument = gql`
    query ExplorerProposal($id: ID!) {
  proposal(id: $id) {
    id
    rationale {
      title
      description
    }
  }
}
    `;

/**
 * __useExplorerProposalQuery__
 *
 * To run a query within a React component, call `useExplorerProposalQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerProposalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerProposalQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExplorerProposalQuery(baseOptions: Apollo.QueryHookOptions<ExplorerProposalQuery, ExplorerProposalQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerProposalQuery, ExplorerProposalQueryVariables>(ExplorerProposalDocument, options);
      }
export function useExplorerProposalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerProposalQuery, ExplorerProposalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerProposalQuery, ExplorerProposalQueryVariables>(ExplorerProposalDocument, options);
        }
export type ExplorerProposalQueryHookResult = ReturnType<typeof useExplorerProposalQuery>;
export type ExplorerProposalLazyQueryHookResult = ReturnType<typeof useExplorerProposalLazyQuery>;
export type ExplorerProposalQueryResult = Apollo.QueryResult<ExplorerProposalQuery, ExplorerProposalQueryVariables>;