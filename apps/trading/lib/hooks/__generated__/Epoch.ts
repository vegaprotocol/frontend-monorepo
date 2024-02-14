import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type EpochInfoQueryVariables = Types.Exact<{
  epochId?: Types.InputMaybe<Types.Scalars['ID']>;
}>;


export type EpochInfoQuery = { __typename?: 'Query', epoch: { __typename?: 'Epoch', id: string, timestamps: { __typename?: 'EpochTimestamps', start?: any | null, end?: any | null, expiry?: any | null } } };


export const EpochInfoDocument = gql`
    query EpochInfo($epochId: ID) {
  epoch(id: $epochId) {
    id
    timestamps {
      start
      end
      expiry
    }
  }
}
    `;

/**
 * __useEpochInfoQuery__
 *
 * To run a query within a React component, call `useEpochInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useEpochInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEpochInfoQuery({
 *   variables: {
 *      epochId: // value for 'epochId'
 *   },
 * });
 */
export function useEpochInfoQuery(baseOptions?: Apollo.QueryHookOptions<EpochInfoQuery, EpochInfoQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<EpochInfoQuery, EpochInfoQueryVariables>(EpochInfoDocument, options);
      }
export function useEpochInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<EpochInfoQuery, EpochInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<EpochInfoQuery, EpochInfoQueryVariables>(EpochInfoDocument, options);
        }
export type EpochInfoQueryHookResult = ReturnType<typeof useEpochInfoQuery>;
export type EpochInfoLazyQueryHookResult = ReturnType<typeof useEpochInfoLazyQuery>;
export type EpochInfoQueryResult = Apollo.QueryResult<EpochInfoQuery, EpochInfoQueryVariables>;