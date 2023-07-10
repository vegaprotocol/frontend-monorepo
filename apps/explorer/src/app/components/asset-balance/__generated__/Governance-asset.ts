import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerGovernanceAssetQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ExplorerGovernanceAssetQuery = { __typename: 'Query', networkParameter?: { __typename: 'NetworkParameter', value: string } | null };


export const ExplorerGovernanceAssetDocument = gql`
    query ExplorerGovernanceAsset {
  networkParameter(key: "reward.asset") {
    value
  }
}
    `;

/**
 * __useExplorerGovernanceAssetQuery__
 *
 * To run a query within a React component, call `useExplorerGovernanceAssetQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerGovernanceAssetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerGovernanceAssetQuery({
 *   variables: {
 *   },
 * });
 */
export function useExplorerGovernanceAssetQuery(baseOptions?: Apollo.QueryHookOptions<ExplorerGovernanceAssetQuery, ExplorerGovernanceAssetQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerGovernanceAssetQuery, ExplorerGovernanceAssetQueryVariables>(ExplorerGovernanceAssetDocument, options);
      }
export function useExplorerGovernanceAssetLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerGovernanceAssetQuery, ExplorerGovernanceAssetQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerGovernanceAssetQuery, ExplorerGovernanceAssetQueryVariables>(ExplorerGovernanceAssetDocument, options);
        }
export type ExplorerGovernanceAssetQueryHookResult = ReturnType<typeof useExplorerGovernanceAssetQuery>;
export type ExplorerGovernanceAssetLazyQueryHookResult = ReturnType<typeof useExplorerGovernanceAssetLazyQuery>;
export type ExplorerGovernanceAssetQueryResult = Apollo.QueryResult<ExplorerGovernanceAssetQuery, ExplorerGovernanceAssetQueryVariables>;