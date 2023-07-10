import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerEpochQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ExplorerEpochQuery = { __typename: 'Query', epoch: { __typename: 'Epoch', id: string, timestamps: { __typename: 'EpochTimestamps', start?: any | null, end?: any | null, firstBlock: string, lastBlock?: string | null } } };

export type ExplorerFutureEpochQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ExplorerFutureEpochQuery = { __typename: 'Query', networkParameter?: { __typename: 'NetworkParameter', value: string } | null, epoch: { __typename: 'Epoch', id: string, timestamps: { __typename: 'EpochTimestamps', start?: any | null } } };


export const ExplorerEpochDocument = gql`
    query ExplorerEpoch($id: ID!) {
  epoch(id: $id) {
    id
    timestamps {
      start
      end
      firstBlock
      lastBlock
    }
  }
}
    `;

/**
 * __useExplorerEpochQuery__
 *
 * To run a query within a React component, call `useExplorerEpochQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerEpochQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerEpochQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExplorerEpochQuery(baseOptions: Apollo.QueryHookOptions<ExplorerEpochQuery, ExplorerEpochQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerEpochQuery, ExplorerEpochQueryVariables>(ExplorerEpochDocument, options);
      }
export function useExplorerEpochLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerEpochQuery, ExplorerEpochQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerEpochQuery, ExplorerEpochQueryVariables>(ExplorerEpochDocument, options);
        }
export type ExplorerEpochQueryHookResult = ReturnType<typeof useExplorerEpochQuery>;
export type ExplorerEpochLazyQueryHookResult = ReturnType<typeof useExplorerEpochLazyQuery>;
export type ExplorerEpochQueryResult = Apollo.QueryResult<ExplorerEpochQuery, ExplorerEpochQueryVariables>;
export const ExplorerFutureEpochDocument = gql`
    query ExplorerFutureEpoch {
  networkParameter(key: "validators.epoch.length") {
    value
  }
  epoch {
    id
    timestamps {
      start
    }
  }
}
    `;

/**
 * __useExplorerFutureEpochQuery__
 *
 * To run a query within a React component, call `useExplorerFutureEpochQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerFutureEpochQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerFutureEpochQuery({
 *   variables: {
 *   },
 * });
 */
export function useExplorerFutureEpochQuery(baseOptions?: Apollo.QueryHookOptions<ExplorerFutureEpochQuery, ExplorerFutureEpochQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerFutureEpochQuery, ExplorerFutureEpochQueryVariables>(ExplorerFutureEpochDocument, options);
      }
export function useExplorerFutureEpochLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerFutureEpochQuery, ExplorerFutureEpochQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerFutureEpochQuery, ExplorerFutureEpochQueryVariables>(ExplorerFutureEpochDocument, options);
        }
export type ExplorerFutureEpochQueryHookResult = ReturnType<typeof useExplorerFutureEpochQuery>;
export type ExplorerFutureEpochLazyQueryHookResult = ReturnType<typeof useExplorerFutureEpochLazyQuery>;
export type ExplorerFutureEpochQueryResult = Apollo.QueryResult<ExplorerFutureEpochQuery, ExplorerFutureEpochQueryVariables>;