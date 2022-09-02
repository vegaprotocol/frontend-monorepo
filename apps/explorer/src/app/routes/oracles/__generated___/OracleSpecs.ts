import * as Types from '@vegaprotocol/types/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OracleSpecsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type OracleSpecsQuery = { __typename?: 'Query', oracleSpecs?: Array<{ __typename?: 'OracleSpec', status: Types.OracleSpecStatus, id: string, createdAt: string, updatedAt?: string | null, pubKeys?: Array<string> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null, data: Array<{ __typename?: 'OracleData', pubKeys?: Array<string> | null }> }> | null };


export const OracleSpecsDocument = gql`
    query OracleSpecs {
  oracleSpecs {
    status
    id
    createdAt
    updatedAt
    pubKeys
    filters {
      key {
        name
        type
      }
      conditions {
        value
        operator
      }
    }
    data {
      pubKeys
    }
  }
}
    `;

/**
 * __useOracleSpecsQuery__
 *
 * To run a query within a React component, call `useOracleSpecsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOracleSpecsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOracleSpecsQuery({
 *   variables: {
 *   },
 * });
 */
export function useOracleSpecsQuery(baseOptions?: Apollo.QueryHookOptions<OracleSpecsQuery, OracleSpecsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OracleSpecsQuery, OracleSpecsQueryVariables>(OracleSpecsDocument, options);
      }
export function useOracleSpecsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OracleSpecsQuery, OracleSpecsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OracleSpecsQuery, OracleSpecsQueryVariables>(OracleSpecsDocument, options);
        }
export type OracleSpecsQueryHookResult = ReturnType<typeof useOracleSpecsQuery>;
export type OracleSpecsLazyQueryHookResult = ReturnType<typeof useOracleSpecsLazyQuery>;
export type OracleSpecsQueryResult = Apollo.QueryResult<OracleSpecsQuery, OracleSpecsQueryVariables>;