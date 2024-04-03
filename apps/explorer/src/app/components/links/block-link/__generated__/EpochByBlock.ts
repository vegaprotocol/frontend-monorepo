import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerEpochForBlockQueryVariables = Types.Exact<{
  block: Types.Scalars['String'];
}>;


export type ExplorerEpochForBlockQuery = { __typename?: 'Query', epoch: { __typename?: 'Epoch', id: string, timestamps: { __typename?: 'EpochTimestamps', start?: any | null, end?: any | null, lastBlock?: string | null } } };


export const ExplorerEpochForBlockDocument = gql`
    query ExplorerEpochForBlock($block: String!) {
  epoch(block: $block) {
    id
    timestamps {
      start
      end
      lastBlock
    }
  }
}
    `;

/**
 * __useExplorerEpochForBlockQuery__
 *
 * To run a query within a React component, call `useExplorerEpochForBlockQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerEpochForBlockQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerEpochForBlockQuery({
 *   variables: {
 *      block: // value for 'block'
 *   },
 * });
 */
export function useExplorerEpochForBlockQuery(baseOptions: Apollo.QueryHookOptions<ExplorerEpochForBlockQuery, ExplorerEpochForBlockQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerEpochForBlockQuery, ExplorerEpochForBlockQueryVariables>(ExplorerEpochForBlockDocument, options);
      }
export function useExplorerEpochForBlockLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerEpochForBlockQuery, ExplorerEpochForBlockQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerEpochForBlockQuery, ExplorerEpochForBlockQueryVariables>(ExplorerEpochForBlockDocument, options);
        }
export type ExplorerEpochForBlockQueryHookResult = ReturnType<typeof useExplorerEpochForBlockQuery>;
export type ExplorerEpochForBlockLazyQueryHookResult = ReturnType<typeof useExplorerEpochForBlockLazyQuery>;
export type ExplorerEpochForBlockQueryResult = Apollo.QueryResult<ExplorerEpochForBlockQuery, ExplorerEpochForBlockQueryVariables>;