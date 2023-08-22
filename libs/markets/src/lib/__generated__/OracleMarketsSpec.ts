import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import { DataSourceSpecFragmentDoc } from './markets';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OracleMarketSpecFieldsFragment = { __typename?: 'Market', id: string, state: Types.MarketState, tradingMode: Types.MarketTradingMode, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, product: { __typename?: 'Future', dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null } }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } } }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null } }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'Perpetual', dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null } }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } } }, dataSourceSpecForSettlementSchedule: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null } }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string } } | { __typename?: 'Spot' } } } };

export type OracleMarketsSpecQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type OracleMarketsSpecQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', id: string, state: Types.MarketState, tradingMode: Types.MarketTradingMode, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, product: { __typename?: 'Future', dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null } }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } } }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null } }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'Perpetual', dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null } }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } } }, dataSourceSpecForSettlementSchedule: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null } }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string } } | { __typename?: 'Spot' } } } } }> } | null };

export const OracleMarketSpecFieldsFragmentDoc = gql`
    fragment OracleMarketSpecFields on Market {
  id
  state
  tradingMode
  tradableInstrument {
    instrument {
      id
      name
      code
      product {
        ... on Future {
          dataSourceSpecForSettlementData {
            id
            data {
              ...DataSourceSpec
            }
          }
          dataSourceSpecForTradingTermination {
            id
            data {
              ...DataSourceSpec
            }
          }
          dataSourceSpecBinding {
            settlementDataProperty
            tradingTerminationProperty
          }
        }
        ... on Perpetual {
          dataSourceSpecForSettlementData {
            id
            data {
              ...DataSourceSpec
            }
          }
          dataSourceSpecForSettlementSchedule {
            id
            data {
              ...DataSourceSpec
            }
          }
          dataSourceSpecBinding {
            settlementDataProperty
            settlementScheduleProperty
          }
        }
      }
    }
  }
}
    ${DataSourceSpecFragmentDoc}`;
export const OracleMarketsSpecDocument = gql`
    query OracleMarketsSpec {
  marketsConnection {
    edges {
      node {
        ...OracleMarketSpecFields
      }
    }
  }
}
    ${OracleMarketSpecFieldsFragmentDoc}`;

/**
 * __useOracleMarketsSpecQuery__
 *
 * To run a query within a React component, call `useOracleMarketsSpecQuery` and pass it any options that fit your needs.
 * When your component renders, `useOracleMarketsSpecQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOracleMarketsSpecQuery({
 *   variables: {
 *   },
 * });
 */
export function useOracleMarketsSpecQuery(baseOptions?: Apollo.QueryHookOptions<OracleMarketsSpecQuery, OracleMarketsSpecQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OracleMarketsSpecQuery, OracleMarketsSpecQueryVariables>(OracleMarketsSpecDocument, options);
      }
export function useOracleMarketsSpecLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OracleMarketsSpecQuery, OracleMarketsSpecQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OracleMarketsSpecQuery, OracleMarketsSpecQueryVariables>(OracleMarketsSpecDocument, options);
        }
export type OracleMarketsSpecQueryHookResult = ReturnType<typeof useOracleMarketsSpecQuery>;
export type OracleMarketsSpecLazyQueryHookResult = ReturnType<typeof useOracleMarketsSpecLazyQuery>;
export type OracleMarketsSpecQueryResult = Apollo.QueryResult<OracleMarketsSpecQuery, OracleMarketsSpecQueryVariables>;