import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerOracleDataConnectionFragment = { __typename?: 'OracleSpec', dataConnection: { __typename?: 'OracleDataConnection', edges?: Array<{ __typename?: 'OracleDataEdge', node: { __typename?: 'OracleData', externalData: { __typename?: 'ExternalData', data: { __typename?: 'Data', matchedSpecIds?: Array<string> | null, broadcastAt: any, signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, data?: Array<{ __typename?: 'Property', name: string, value: string }> | null } } } } | null> | null } };

export type ExplorerOracleDataSourceFragment = { __typename?: 'OracleSpec', dataSourceSpec: { __typename?: 'ExternalDataSourceSpec', spec: { __typename?: 'DataSourceSpec', id: string, createdAt: any, updatedAt?: any | null, status: Types.DataSourceSpecStatus, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, args?: Array<string> | null, method: string, requiredConfirmations: number, address: string, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger', conditions: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator } | null>, triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null> } } } } }, dataConnection: { __typename?: 'OracleDataConnection', edges?: Array<{ __typename?: 'OracleDataEdge', node: { __typename?: 'OracleData', externalData: { __typename?: 'ExternalData', data: { __typename?: 'Data', matchedSpecIds?: Array<string> | null, broadcastAt: any, signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, data?: Array<{ __typename?: 'Property', name: string, value: string }> | null } } } } | null> | null } };

export type ExplorerOracleSpecsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ExplorerOracleSpecsQuery = { __typename?: 'Query', oracleSpecsConnection?: { __typename?: 'OracleSpecsConnection', pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean }, edges?: Array<{ __typename?: 'OracleSpecEdge', node: { __typename?: 'OracleSpec', dataSourceSpec: { __typename?: 'ExternalDataSourceSpec', spec: { __typename?: 'DataSourceSpec', id: string, createdAt: any, updatedAt?: any | null, status: Types.DataSourceSpecStatus, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, args?: Array<string> | null, method: string, requiredConfirmations: number, address: string, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger', conditions: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator } | null>, triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null> } } } } }, dataConnection: { __typename?: 'OracleDataConnection', edges?: Array<{ __typename?: 'OracleDataEdge', node: { __typename?: 'OracleData', externalData: { __typename?: 'ExternalData', data: { __typename?: 'Data', matchedSpecIds?: Array<string> | null, broadcastAt: any, signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, data?: Array<{ __typename?: 'Property', name: string, value: string }> | null } } } } | null> | null } } } | null> | null } | null };

export type ExplorerOracleSpecByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ExplorerOracleSpecByIdQuery = { __typename?: 'Query', oracleSpec?: { __typename?: 'OracleSpec', dataSourceSpec: { __typename?: 'ExternalDataSourceSpec', spec: { __typename?: 'DataSourceSpec', id: string, createdAt: any, updatedAt?: any | null, status: Types.DataSourceSpecStatus, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, args?: Array<string> | null, method: string, requiredConfirmations: number, address: string, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger', conditions: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator } | null>, triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null> } } } } }, dataConnection: { __typename?: 'OracleDataConnection', edges?: Array<{ __typename?: 'OracleDataEdge', node: { __typename?: 'OracleData', externalData: { __typename?: 'ExternalData', data: { __typename?: 'Data', matchedSpecIds?: Array<string> | null, broadcastAt: any, signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, data?: Array<{ __typename?: 'Property', name: string, value: string }> | null } } } } | null> | null } } | null };

export const ExplorerOracleDataConnectionFragmentDoc = gql`
    fragment ExplorerOracleDataConnection on OracleSpec {
  dataConnection(pagination: {last: 30}) {
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
export const ExplorerOracleDataSourceFragmentDoc = gql`
    fragment ExplorerOracleDataSource on OracleSpec {
  ...ExplorerOracleDataConnection
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
              ... on DataSourceSpecConfigurationTimeTrigger {
                conditions {
                  value
                  operator
                }
                triggers {
                  initial
                  every
                }
              }
            }
          }
          ... on DataSourceDefinitionExternal {
            sourceType {
              ... on EthCallSpec {
                abi
                args
                method
                requiredConfirmations
                address
                normalisers {
                  name
                  expression
                }
                trigger {
                  trigger {
                    ... on EthTimeTrigger {
                      initial
                      every
                      until
                    }
                  }
                }
                filters {
                  key {
                    name
                    type
                    numberDecimalPlaces
                  }
                  conditions {
                    value
                    operator
                  }
                }
              }
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
                    numberDecimalPlaces
                  }
                  conditions {
                    value
                    operator
                  }
                }
              }
              ... on EthCallSpec {
                abi
                address
                requiredConfirmations
                method
                filters {
                  key {
                    type
                    name
                    numberDecimalPlaces
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
    ${ExplorerOracleDataConnectionFragmentDoc}`;
export const ExplorerOracleSpecsDocument = gql`
    query ExplorerOracleSpecs {
  oracleSpecsConnection(pagination: {last: 30}) {
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
  }
}
    ${ExplorerOracleDataSourceFragmentDoc}`;

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