import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerOracleForMarketsMarketFragment = { __typename?: 'Market', id: string, state: Types.MarketState, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', product: { __typename?: 'Future', dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string, status: Types.DataSourceSpecStatus }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string, status: Types.DataSourceSpecStatus } } | { __typename?: 'Perpetual', dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string, status: Types.DataSourceSpecStatus }, dataSourceSpecForSettlementSchedule: { __typename?: 'DataSourceSpec', id: string, status: Types.DataSourceSpecStatus } } | { __typename?: 'Spot' } } } };

export type ExplorerOracleFormMarketsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ExplorerOracleFormMarketsQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', id: string, state: Types.MarketState, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', product: { __typename?: 'Future', dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string, status: Types.DataSourceSpecStatus }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string, status: Types.DataSourceSpecStatus } } | { __typename?: 'Perpetual', dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string, status: Types.DataSourceSpecStatus }, dataSourceSpecForSettlementSchedule: { __typename?: 'DataSourceSpec', id: string, status: Types.DataSourceSpecStatus } } | { __typename?: 'Spot' } } } } }> } | null, oracleSpecsConnection?: { __typename?: 'OracleSpecsConnection', edges?: Array<{ __typename?: 'OracleSpecEdge', node: { __typename?: 'OracleSpec', dataSourceSpec: { __typename?: 'ExternalDataSourceSpec', spec: { __typename?: 'DataSourceSpec', id: string, status: Types.DataSourceSpecStatus, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null } | { __typename?: 'EthCallSpec', address: string } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger', conditions: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator } | null>, triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null> } } } } }, dataConnection: { __typename?: 'OracleDataConnection', edges?: Array<{ __typename?: 'OracleDataEdge', node: { __typename?: 'OracleData', externalData: { __typename?: 'ExternalData', data: { __typename?: 'Data', data?: Array<{ __typename?: 'Property', name: string, value: string }> | null } } } } | null> | null } } } | null> | null } | null };

export const ExplorerOracleForMarketsMarketFragmentDoc = gql`
    fragment ExplorerOracleForMarketsMarket on Market {
  id
  state
  tradableInstrument {
    instrument {
      product {
        ... on Future {
          dataSourceSpecForSettlementData {
            id
            status
          }
          dataSourceSpecForTradingTermination {
            id
            status
          }
        }
        ... on Perpetual {
          dataSourceSpecForSettlementData {
            id
            status
          }
          dataSourceSpecForSettlementSchedule {
            id
            status
          }
        }
      }
    }
  }
}
    `;
export const ExplorerOracleFormMarketsDocument = gql`
    query ExplorerOracleFormMarkets {
  marketsConnection {
    edges {
      node {
        ...ExplorerOracleForMarketsMarket
      }
    }
  }
  oracleSpecsConnection {
    edges {
      node {
        dataSourceSpec {
          spec {
            id
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
                      address
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
                    }
                  }
                }
              }
            }
          }
        }
        dataConnection(pagination: {first: 1}) {
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
  }
}
    ${ExplorerOracleForMarketsMarketFragmentDoc}`;

/**
 * __useExplorerOracleFormMarketsQuery__
 *
 * To run a query within a React component, call `useExplorerOracleFormMarketsQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerOracleFormMarketsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerOracleFormMarketsQuery({
 *   variables: {
 *   },
 * });
 */
export function useExplorerOracleFormMarketsQuery(baseOptions?: Apollo.QueryHookOptions<ExplorerOracleFormMarketsQuery, ExplorerOracleFormMarketsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerOracleFormMarketsQuery, ExplorerOracleFormMarketsQueryVariables>(ExplorerOracleFormMarketsDocument, options);
      }
export function useExplorerOracleFormMarketsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerOracleFormMarketsQuery, ExplorerOracleFormMarketsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerOracleFormMarketsQuery, ExplorerOracleFormMarketsQueryVariables>(ExplorerOracleFormMarketsDocument, options);
        }
export type ExplorerOracleFormMarketsQueryHookResult = ReturnType<typeof useExplorerOracleFormMarketsQuery>;
export type ExplorerOracleFormMarketsLazyQueryHookResult = ReturnType<typeof useExplorerOracleFormMarketsLazyQuery>;
export type ExplorerOracleFormMarketsQueryResult = Apollo.QueryResult<ExplorerOracleFormMarketsQuery, ExplorerOracleFormMarketsQueryVariables>;