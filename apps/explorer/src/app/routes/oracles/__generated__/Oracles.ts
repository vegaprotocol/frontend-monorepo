import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OracleSpecsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type OracleSpecsQuery = { __typename?: 'Query', oracleSpecsConnection?: { __typename?: 'OracleSpecsConnection', edges?: Array<{ __typename?: 'OracleSpecEdge', node: { __typename?: 'OracleSpec', dataSourceSpec: { __typename?: 'ExternalDataSourceSpec', spec: { __typename?: 'DataSourceSpec', id: string, createdAt: any, updatedAt?: any | null, status: Types.DataSourceSpecStatus, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator } | null> } } } } }, dataConnection: { __typename?: 'OracleDataConnection', edges?: Array<{ __typename?: 'OracleDataEdge', node: { __typename?: 'OracleData', externalData: { __typename?: 'ExternalData', data: { __typename?: 'Data', matchedSpecIds?: Array<string> | null, broadcastAt: any, signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, data?: Array<{ __typename?: 'Property', name: string, value: string }> | null } } } } | null> | null } } } | null> | null } | null };


export const OracleSpecsDocument = gql`
    query OracleSpecs {
  oracleSpecsConnection {
    edges {
      node {
        dataSourceSpec {
          spec {
            id
            createdAt
            updatedAt
            status
            data {
              sourceType {
                ... on DataSourceDefinitionInternal {
                  sourceType {
                    ... on DataSourceSpecConfigurationTime {
                      conditions {
                        value
                        operator
                      }
                    }
                  }
                }
                ... on DataSourceDefinitionExternal {
                  sourceType {
                    ... on DataSourceSpecConfiguration {
                      signers {
                        signer {
                          ... on ETHAddress {
                            address
                          }
                          ... on PubKey {
                            key
                          }
                        }
                      }
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
                    }
                  }
                }
              }
            }
          }
        }
        dataConnection {
          edges {
            node {
              externalData {
                data {
                  signers {
                    signer {
                      ... on ETHAddress {
                        address
                      }
                      ... on PubKey {
                        key
                      }
                    }
                  }
                  data {
                    name
                    value
                  }
                  matchedSpecIds
                  broadcastAt
                }
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