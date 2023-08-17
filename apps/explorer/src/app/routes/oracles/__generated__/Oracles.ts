import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerOracleDataSourceFragment = { __typename?: 'OracleSpec', dataSourceSpec: { __typename?: 'ExternalDataSourceSpec', spec: { __typename?: 'DataSourceSpec', id: string, createdAt: any, updatedAt?: any | null, status: Types.DataSourceSpecStatus, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } } } } };

export type ExplorerOracleDataConnectionFragment = { __typename?: 'OracleSpec', dataConnection: { __typename?: 'OracleDataConnection', pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean }, edges?: Array<{ __typename?: 'OracleDataEdge', node: { __typename?: 'OracleData', externalData: { __typename?: 'ExternalData', data: { __typename?: 'Data', matchedSpecIds?: Array<string> | null, broadcastAt: any, signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, data?: Array<{ __typename?: 'Property', name: string, value: string }> | null } } } } | null> | null } };

export type ExplorerOracleSpecsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ExplorerOracleSpecsQuery = { __typename?: 'Query', oracleSpecsConnection?: { __typename?: 'OracleSpecsConnection', pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean }, edges?: Array<{ __typename?: 'OracleSpecEdge', node: { __typename?: 'OracleSpec', dataSourceSpec: { __typename?: 'ExternalDataSourceSpec', spec: { __typename?: 'DataSourceSpec', id: string, createdAt: any, updatedAt?: any | null, status: Types.DataSourceSpecStatus, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } } } } } } | null> | null } | null };

export type ExplorerOracleSpecByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ExplorerOracleSpecByIdQuery = { __typename?: 'Query', oracleSpec?: { __typename?: 'OracleSpec', dataSourceSpec: { __typename?: 'ExternalDataSourceSpec', spec: { __typename?: 'DataSourceSpec', id: string, createdAt: any, updatedAt?: any | null, status: Types.DataSourceSpecStatus, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } } } }, dataConnection: { __typename?: 'OracleDataConnection', pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean }, edges?: Array<{ __typename?: 'OracleDataEdge', node: { __typename?: 'OracleData', externalData: { __typename?: 'ExternalData', data: { __typename?: 'Data', matchedSpecIds?: Array<string> | null, broadcastAt: any, signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, data?: Array<{ __typename?: 'Property', name: string, value: string }> | null } } } } | null> | null } } | null };

export const ExplorerOracleDataSourceFragmentDoc = gql`
    fragment ExplorerOracleDataSource on OracleSpec {
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
}
    `;
export const ExplorerOracleDataConnectionFragmentDoc = gql`
    fragment ExplorerOracleDataConnection on OracleSpec {
  dataConnection {
    pageInfo {
      hasNextPage
    }
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
    `;
export const ExplorerOracleSpecsDocument = gql`
    query ExplorerOracleSpecs {
  oracleSpecsConnection(pagination: {first: 50}) {
    pageInfo {
      hasNextPage
    }
    edges {
      node {
        ...ExplorerOracleDataSource
      }
    }
  }
}
    ${ExplorerOracleDataSourceFragmentDoc}`;

/**
 * __useExplorerOracleSpecsQuery__
 *
 * To run a query within a React component, call `useExplorerOracleSpecsQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerOracleSpecsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerOracleSpecsQuery({
 *   variables: {
 *   },
 * });
 */
export function useExplorerOracleSpecsQuery(baseOptions?: Apollo.QueryHookOptions<ExplorerOracleSpecsQuery, ExplorerOracleSpecsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerOracleSpecsQuery, ExplorerOracleSpecsQueryVariables>(ExplorerOracleSpecsDocument, options);
      }
export function useExplorerOracleSpecsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerOracleSpecsQuery, ExplorerOracleSpecsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerOracleSpecsQuery, ExplorerOracleSpecsQueryVariables>(ExplorerOracleSpecsDocument, options);
        }
export type ExplorerOracleSpecsQueryHookResult = ReturnType<typeof useExplorerOracleSpecsQuery>;
export type ExplorerOracleSpecsLazyQueryHookResult = ReturnType<typeof useExplorerOracleSpecsLazyQuery>;
export type ExplorerOracleSpecsQueryResult = Apollo.QueryResult<ExplorerOracleSpecsQuery, ExplorerOracleSpecsQueryVariables>;
export const ExplorerOracleSpecByIdDocument = gql`
    query ExplorerOracleSpecById($id: ID!) {
  oracleSpec(oracleSpecId: $id) {
    ...ExplorerOracleDataSource
    ...ExplorerOracleDataConnection
  }
}
    ${ExplorerOracleDataSourceFragmentDoc}
${ExplorerOracleDataConnectionFragmentDoc}`;

/**
 * __useExplorerOracleSpecByIdQuery__
 *
 * To run a query within a React component, call `useExplorerOracleSpecByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerOracleSpecByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerOracleSpecByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExplorerOracleSpecByIdQuery(baseOptions: Apollo.QueryHookOptions<ExplorerOracleSpecByIdQuery, ExplorerOracleSpecByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerOracleSpecByIdQuery, ExplorerOracleSpecByIdQueryVariables>(ExplorerOracleSpecByIdDocument, options);
      }
export function useExplorerOracleSpecByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerOracleSpecByIdQuery, ExplorerOracleSpecByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerOracleSpecByIdQuery, ExplorerOracleSpecByIdQueryVariables>(ExplorerOracleSpecByIdDocument, options);
        }
export type ExplorerOracleSpecByIdQueryHookResult = ReturnType<typeof useExplorerOracleSpecByIdQuery>;
export type ExplorerOracleSpecByIdLazyQueryHookResult = ReturnType<typeof useExplorerOracleSpecByIdLazyQuery>;
export type ExplorerOracleSpecByIdQueryResult = Apollo.QueryResult<ExplorerOracleSpecByIdQuery, ExplorerOracleSpecByIdQueryVariables>;