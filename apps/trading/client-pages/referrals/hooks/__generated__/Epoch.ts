import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CurrentEpochInfoQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type CurrentEpochInfoQuery = { __typename?: 'Query', epoch: { __typename?: 'Epoch', id: string, timestamps: { __typename?: 'EpochTimestamps', start?: any | null, end?: any | null } } };


export const CurrentEpochInfoDocument = gql`
    query CurrentEpochInfo {
  epoch {
    id
    timestamps {
      start
      end
    }
  }
}
    `;

/**
 * __useCurrentEpochInfoQuery__
 *
 * To run a query within a React component, call `useCurrentEpochInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentEpochInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentEpochInfoQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentEpochInfoQuery(baseOptions?: Apollo.QueryHookOptions<CurrentEpochInfoQuery, CurrentEpochInfoQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CurrentEpochInfoQuery, CurrentEpochInfoQueryVariables>(CurrentEpochInfoDocument, options);
      }
export function useCurrentEpochInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CurrentEpochInfoQuery, CurrentEpochInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CurrentEpochInfoQuery, CurrentEpochInfoQueryVariables>(CurrentEpochInfoDocument, options);
        }
export type CurrentEpochInfoQueryHookResult = ReturnType<typeof useCurrentEpochInfoQuery>;
export type CurrentEpochInfoLazyQueryHookResult = ReturnType<typeof useCurrentEpochInfoLazyQuery>;
export type CurrentEpochInfoQueryResult = Apollo.QueryResult<CurrentEpochInfoQuery, CurrentEpochInfoQueryVariables>;