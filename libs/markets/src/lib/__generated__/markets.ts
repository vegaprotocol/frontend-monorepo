import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DataSourceFilterFragment = { __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null } };

export type DataSourceSpecFragment = { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null } }> | null } } | { __typename?: 'DataSourceDefinitionInternal' } };

export type MarketFieldsFragment = { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, parentMarketID?: string | null, successorMarketID?: string | null, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string } }, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number, quantum: string }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null } }> | null } } | { __typename?: 'DataSourceDefinitionInternal' } } }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null } }> | null } } | { __typename?: 'DataSourceDefinitionInternal' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } } }, marketTimestamps: { __typename?: 'MarketTimestamps', open: any, close: any } };

export type MarketsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MarketsQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, parentMarketID?: string | null, successorMarketID?: string | null, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string } }, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number, quantum: string }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null } }> | null } } | { __typename?: 'DataSourceDefinitionInternal' } } }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null } }> | null } } | { __typename?: 'DataSourceDefinitionInternal' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } } }, marketTimestamps: { __typename?: 'MarketTimestamps', open: any, close: any } } }> } | null };

export const DataSourceFilterFragmentDoc = gql`
    fragment DataSourceFilter on Filter {
  key {
    name
    type
    numberDecimalPlaces
  }
}
    `;
export const DataSourceSpecFragmentDoc = gql`
    fragment DataSourceSpec on DataSourceDefinition {
  sourceType {
    ... on DataSourceDefinitionExternal {
      sourceType {
        ... on DataSourceSpecConfiguration {
          signers {
            signer {
              ... on PubKey {
                key
              }
              ... on ETHAddress {
                address
              }
            }
          }
          filters {
            ...DataSourceFilter
          }
        }
      }
    }
  }
}
    ${DataSourceFilterFragmentDoc}`;
export const MarketFieldsFragmentDoc = gql`
    fragment MarketFields on Market {
  id
  decimalPlaces
  positionDecimalPlaces
  state
  tradingMode
  parentMarketID
  successorMarketID
  fees {
    factors {
      makerFee
      infrastructureFee
      liquidityFee
    }
  }
  tradableInstrument {
    instrument {
      id
      name
      code
      metadata {
        tags
      }
      product {
        ... on Future {
          settlementAsset {
            id
            symbol
            name
            decimals
            quantum
          }
          quoteName
          dataSourceSpecForTradingTermination {
            id
            data {
              ...DataSourceSpec
            }
          }
          dataSourceSpecForSettlementData {
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
      }
    }
  }
  marketTimestamps {
    open
    close
  }
}
    ${DataSourceSpecFragmentDoc}`;
export const MarketsDocument = gql`
    query Markets {
  marketsConnection {
    edges {
      node {
        ...MarketFields
      }
    }
  }
}
    ${MarketFieldsFragmentDoc}`;

/**
 * __useMarketsQuery__
 *
 * To run a query within a React component, call `useMarketsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketsQuery({
 *   variables: {
 *   },
 * });
 */
export function useMarketsQuery(baseOptions?: Apollo.QueryHookOptions<MarketsQuery, MarketsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketsQuery, MarketsQueryVariables>(MarketsDocument, options);
      }
export function useMarketsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketsQuery, MarketsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketsQuery, MarketsQueryVariables>(MarketsDocument, options);
        }
export type MarketsQueryHookResult = ReturnType<typeof useMarketsQuery>;
export type MarketsLazyQueryHookResult = ReturnType<typeof useMarketsLazyQuery>;
export type MarketsQueryResult = Apollo.QueryResult<MarketsQuery, MarketsQueryVariables>;