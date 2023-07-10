import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OracleSpecDataConnectionQueryVariables = Types.Exact<{
  oracleSpecId: Types.Scalars['ID'];
}>;


export type OracleSpecDataConnectionQuery = { __typename: 'Query', oracleSpec?: { __typename: 'OracleSpec', dataConnection: { __typename: 'OracleDataConnection', edges?: Array<{ __typename: 'OracleDataEdge', node: { __typename: 'OracleData', externalData: { __typename: 'ExternalData', data: { __typename: 'Data', data?: Array<{ __typename: 'Property', name: string, value: string }> | null } } } } | null> | null } } | null };


export const OracleSpecDataConnectionDocument = gql`
    query OracleSpecDataConnection($oracleSpecId: ID!) {
  oracleSpec(oracleSpecId: $oracleSpecId) {
    dataConnection {
      edges {
        node {
          externalData {
            data {
              data {
                name
                value
              }
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useOracleSpecDataConnectionQuery__
 *
 * To run a query within a React component, call `useOracleSpecDataConnectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useOracleSpecDataConnectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOracleSpecDataConnectionQuery({
 *   variables: {
 *      oracleSpecId: // value for 'oracleSpecId'
 *   },
 * });
 */
export function useOracleSpecDataConnectionQuery(baseOptions: Apollo.QueryHookOptions<OracleSpecDataConnectionQuery, OracleSpecDataConnectionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OracleSpecDataConnectionQuery, OracleSpecDataConnectionQueryVariables>(OracleSpecDataConnectionDocument, options);
      }
export function useOracleSpecDataConnectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OracleSpecDataConnectionQuery, OracleSpecDataConnectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OracleSpecDataConnectionQuery, OracleSpecDataConnectionQueryVariables>(OracleSpecDataConnectionDocument, options);
        }
export type OracleSpecDataConnectionQueryHookResult = ReturnType<typeof useOracleSpecDataConnectionQuery>;
export type OracleSpecDataConnectionLazyQueryHookResult = ReturnType<typeof useOracleSpecDataConnectionLazyQuery>;
export type OracleSpecDataConnectionQueryResult = Apollo.QueryResult<OracleSpecDataConnectionQuery, OracleSpecDataConnectionQueryVariables>;