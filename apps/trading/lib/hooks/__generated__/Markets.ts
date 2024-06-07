import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import { PriceConfigurationFragmentDoc, FutureFragmentDoc, PerpetualFragmentDoc, SpotFragmentDoc } from '../../../../../libs/markets/src/lib/components/market-info/__generated__/MarketInfo';
import { AssetListFieldsFragmentDoc } from '../../../../../libs/assets/src/lib/__generated__/Assets';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type FutureV2Fragment = { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number, quantum: string } };

export type PerpetualV2Fragment = { __typename?: 'Perpetual', quoteName: string, fundingRateScalingFactor?: string | null, fundingRateLowerBound?: string | null, fundingRateUpperBound?: string | null, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number, quantum: string }, internalCompositePriceConfig?: { __typename?: 'CompositePriceConfiguration', decayWeight: string, decayPower: number, cashAmount: string, SourceWeights?: Array<string> | null, SourceStalenessTolerance: Array<string>, CompositePriceType: Types.CompositePriceType, dataSourcesSpec?: Array<{ __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } | null> | null, dataSourcesSpecBinding?: Array<{ __typename?: 'SpecBindingForCompositePrice', priceSourceProperty: string } | null> | null } | null };

export type SpotV2Fragment = { __typename?: 'Spot', baseAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string } }, quoteAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string } } };

export type MarketFieldsV2Fragment = { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, tickSize: string, parentMarketID?: string | null, successorMarketID?: string | null, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', feeConstant?: string | null, method: Types.LiquidityFeeMethod } | null }, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number, quantum: string } } | { __typename?: 'Perpetual', quoteName: string, fundingRateScalingFactor?: string | null, fundingRateLowerBound?: string | null, fundingRateUpperBound?: string | null, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number, quantum: string }, internalCompositePriceConfig?: { __typename?: 'CompositePriceConfiguration', decayWeight: string, decayPower: number, cashAmount: string, SourceWeights?: Array<string> | null, SourceStalenessTolerance: Array<string>, CompositePriceType: Types.CompositePriceType, dataSourcesSpec?: Array<{ __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } | null> | null, dataSourcesSpecBinding?: Array<{ __typename?: 'SpecBindingForCompositePrice', priceSourceProperty: string } | null> | null } | null } | { __typename?: 'Spot', baseAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string } }, quoteAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string } } } } }, marketTimestamps: { __typename?: 'MarketTimestamps', proposed?: any | null, pending: any, open: any, close: any }, data?: { __typename?: 'MarketData', marketState: Types.MarketState, marketTradingMode: Types.MarketTradingMode, markPrice: string, openInterest: string, bestOfferPrice: string, bestBidPrice: string, lastTradedPrice: string } | null, candlesConnection?: { __typename?: 'CandleDataConnection', edges?: Array<{ __typename?: 'CandleEdge', node: { __typename?: 'Candle', periodStart: any, high: string, low: string, open: string, close: string, volume: string, notional: string } } | null> | null } | null };

export type MarketsV2QueryVariables = Types.Exact<{
  since: Types.Scalars['String'];
}>;


export type MarketsV2Query = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, tickSize: string, parentMarketID?: string | null, successorMarketID?: string | null, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', feeConstant?: string | null, method: Types.LiquidityFeeMethod } | null }, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number, quantum: string } } | { __typename?: 'Perpetual', quoteName: string, fundingRateScalingFactor?: string | null, fundingRateLowerBound?: string | null, fundingRateUpperBound?: string | null, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number, quantum: string }, internalCompositePriceConfig?: { __typename?: 'CompositePriceConfiguration', decayWeight: string, decayPower: number, cashAmount: string, SourceWeights?: Array<string> | null, SourceStalenessTolerance: Array<string>, CompositePriceType: Types.CompositePriceType, dataSourcesSpec?: Array<{ __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } | null> | null, dataSourcesSpecBinding?: Array<{ __typename?: 'SpecBindingForCompositePrice', priceSourceProperty: string } | null> | null } | null } | { __typename?: 'Spot', baseAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string } }, quoteAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string } } } } }, marketTimestamps: { __typename?: 'MarketTimestamps', proposed?: any | null, pending: any, open: any, close: any }, data?: { __typename?: 'MarketData', marketState: Types.MarketState, marketTradingMode: Types.MarketTradingMode, markPrice: string, openInterest: string, bestOfferPrice: string, bestBidPrice: string, lastTradedPrice: string } | null, candlesConnection?: { __typename?: 'CandleDataConnection', edges?: Array<{ __typename?: 'CandleEdge', node: { __typename?: 'Candle', periodStart: any, high: string, low: string, open: string, close: string, volume: string, notional: string } } | null> | null } | null } }> } | null };

export const FutureV2FragmentDoc = gql`
    fragment FutureV2 on Future {
  quoteName
  settlementAsset {
    id
    symbol
    name
    decimals
    quantum
  }
}
    `;
export const PerpetualV2FragmentDoc = gql`
    fragment PerpetualV2 on Perpetual {
  quoteName
  fundingRateScalingFactor
  fundingRateLowerBound
  fundingRateUpperBound
  settlementAsset {
    id
    symbol
    name
    decimals
    quantum
  }
  internalCompositePriceConfig {
    ...PriceConfiguration
  }
}
    ${PriceConfigurationFragmentDoc}`;
export const SpotV2FragmentDoc = gql`
    fragment SpotV2 on Spot {
  baseAsset {
    ...AssetListFields
  }
  quoteAsset {
    ...AssetListFields
  }
}
    ${AssetListFieldsFragmentDoc}`;
export const MarketFieldsV2FragmentDoc = gql`
    fragment MarketFieldsV2 on Market {
  id
  decimalPlaces
  positionDecimalPlaces
  tickSize
  parentMarketID
  successorMarketID
  fees {
    factors {
      makerFee
      infrastructureFee
      liquidityFee
    }
    liquidityFeeSettings {
      feeConstant
      method
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
          ...FutureV2
        }
        ... on Perpetual {
          ...PerpetualV2
        }
        ... on Spot {
          ...SpotV2
        }
      }
    }
  }
  marketTimestamps {
    proposed
    pending
    open
    close
  }
  data {
    marketState
    marketTradingMode
    markPrice
    openInterest
    bestOfferPrice
    bestBidPrice
    lastTradedPrice
  }
  candlesConnection(since: $since, interval: INTERVAL_I1H, pagination: {last: 24}) {
    edges {
      node {
        periodStart
        high
        low
        open
        close
        volume
        notional
      }
    }
  }
}
    ${FutureV2FragmentDoc}
${PerpetualV2FragmentDoc}
${SpotV2FragmentDoc}`;
export const MarketsV2Document = gql`
    query MarketsV2($since: String!) {
  marketsConnection {
    edges {
      node {
        ...MarketFieldsV2
      }
    }
  }
}
    ${MarketFieldsV2FragmentDoc}`;

/**
 * __useMarketsV2Query__
 *
 * To run a query within a React component, call `useMarketsV2Query` and pass it any options that fit your needs.
 * When your component renders, `useMarketsV2Query` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketsV2Query({
 *   variables: {
 *      since: // value for 'since'
 *   },
 * });
 */
export function useMarketsV2Query(baseOptions: Apollo.QueryHookOptions<MarketsV2Query, MarketsV2QueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketsV2Query, MarketsV2QueryVariables>(MarketsV2Document, options);
      }
export function useMarketsV2LazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketsV2Query, MarketsV2QueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketsV2Query, MarketsV2QueryVariables>(MarketsV2Document, options);
        }
export type MarketsV2QueryHookResult = ReturnType<typeof useMarketsV2Query>;
export type MarketsV2LazyQueryHookResult = ReturnType<typeof useMarketsV2LazyQuery>;
export type MarketsV2QueryResult = Apollo.QueryResult<MarketsV2Query, MarketsV2QueryVariables>;