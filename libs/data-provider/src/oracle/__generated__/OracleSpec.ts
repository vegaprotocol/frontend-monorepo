import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OracleSpecQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type OracleSpecQuery = { __typename?: 'Query', oracleSpec?: { __typename?: 'OracleSpec', dataSourceSpec: { __typename?: 'ExternalDataSourceSpec', spec: { __typename?: 'DataSourceSpec', id: string, createdAt: any, updatedAt?: any | null, status: Types.DataSourceSpecStatus, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec', address: string, abi?: Array<string> | null, method: string, args?: Array<string> | null, requiredConfirmations: number, sourceChainId: number, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null>, triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null> } } } } } } | null };


export const OracleSpecDocument = gql`
    query OracleSpec($id: ID!) {
  oracleSpec(oracleSpecId: $id) {
    dataSourceSpec {
      spec {
        id
        createdAt
        updatedAt
        status
        data {
          sourceType {
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
                      numberDecimalPlaces
                    }
                    conditions {
                      operator
                      value
                    }
                  }
                }
                ... on EthCallSpec {
                  address
                  abi
                  method
                  args
                  trigger {
                    trigger {
                      ... on EthTimeTrigger {
                        initial
                        every
                        until
                      }
                    }
                  }
                  requiredConfirmations
                  normalisers {
                    name
                    expression
                  }
                  filters {
                    key {
                      name
                      type
                      numberDecimalPlaces
                    }
                    conditions {
                      operator
                      value
                    }
                  }
                  sourceChainId
                }
              }
            }
            ... on DataSourceDefinitionInternal {
              sourceType {
                ... on DataSourceSpecConfigurationTime {
                  conditions {
                    operator
                    value
                  }
                }
                ... on DataSourceSpecConfigurationTimeTrigger {
                  conditions {
                    operator
                    value
                  }
                  triggers {
                    initial
                    every
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

/**
 * __useOracleSpecQuery__
 *
 * To run a query within a React component, call `useOracleSpecQuery` and pass it any options that fit your needs.
 * When your component renders, `useOracleSpecQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOracleSpecQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOracleSpecQuery(baseOptions: Apollo.QueryHookOptions<OracleSpecQuery, OracleSpecQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OracleSpecQuery, OracleSpecQueryVariables>(OracleSpecDocument, options);
      }
export function useOracleSpecLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OracleSpecQuery, OracleSpecQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OracleSpecQuery, OracleSpecQueryVariables>(OracleSpecDocument, options);
        }
export type OracleSpecQueryHookResult = ReturnType<typeof useOracleSpecQuery>;
export type OracleSpecLazyQueryHookResult = ReturnType<typeof useOracleSpecLazyQuery>;
export type OracleSpecQueryResult = Apollo.QueryResult<OracleSpecQuery, OracleSpecQueryVariables>;