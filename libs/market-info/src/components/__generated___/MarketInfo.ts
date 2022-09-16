import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketInfoQueryQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
  interval: Types.Interval;
  since: Types.Scalars['String'];
}>;


export type MarketInfoQueryQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, accounts?: Array<{ __typename?: 'Account', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', id: string } }> | null, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string } }, priceMonitoringSettings: { __typename?: 'PriceMonitoringSettings', parameters?: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null } | null }, riskFactors?: { __typename?: 'RiskFactor', market: string, short: string, long: string } | null, data?: { __typename?: 'MarketData', markPrice: string, indicativeVolume: string, bestBidVolume: string, bestOfferVolume: string, bestStaticBidVolume: string, bestStaticOfferVolume: string, openInterest: string, bestBidPrice: string, bestOfferPrice: string, trigger: Types.AuctionTrigger, market: { __typename?: 'Market', id: string }, priceMonitoringBounds?: Array<{ __typename?: 'PriceMonitoringBounds', minValidPrice: string, maxValidPrice: string, referencePrice: string, trigger: { __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number } }> | null } | null, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', triggeringRatio: number, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, candlesConnection?: { __typename?: 'CandleDataConnection', edges?: Array<{ __typename?: 'CandleEdge', node: { __typename?: 'Candle', volume: string } } | null> | null } | null, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string }, oracleSpecForSettlementPrice: { __typename?: 'OracleSpec', id: string }, oracleSpecForTradingTermination: { __typename?: 'OracleSpec', id: string }, oracleSpecBinding: { __typename?: 'OracleSpecToFutureBinding', settlementPriceProperty: string, tradingTerminationProperty: string } } }, riskModel: { __typename?: 'LogNormalRiskModel', tau: number, riskAversionParameter: number, params: { __typename?: 'LogNormalModelParams', r: number, sigma: number, mu: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } } }, depth: { __typename?: 'MarketDepth', lastTrade?: { __typename?: 'Trade', price: string } | null } } | null };


export const MarketInfoQueryDocument = gql`
    query MarketInfoQuery($marketId: ID!, $interval: Interval!, $since: String!) {
  market(id: $marketId) {
    id
    decimalPlaces
    positionDecimalPlaces
    state
    accounts {
      type
      asset {
        id
      }
      balance
    }
    tradingMode
    accounts {
      type
      asset {
        id
      }
      balance
    }
    fees {
      factors {
        makerFee
        infrastructureFee
        liquidityFee
      }
    }
    priceMonitoringSettings {
      parameters {
        triggers {
          horizonSecs
          probability
          auctionExtensionSecs
        }
      }
    }
    riskFactors {
      market
      short
      long
    }
    accounts {
      type
      asset {
        id
      }
      balance
    }
    data {
      market {
        id
      }
      markPrice
      indicativeVolume
      bestBidVolume
      bestOfferVolume
      bestStaticBidVolume
      bestStaticOfferVolume
      openInterest
      bestBidPrice
      bestOfferPrice
      trigger
      priceMonitoringBounds {
        minValidPrice
        maxValidPrice
        trigger {
          horizonSecs
          probability
          auctionExtensionSecs
        }
        referencePrice
      }
    }
    liquidityMonitoringParameters {
      triggeringRatio
      targetStakeParameters {
        timeWindow
        scalingFactor
      }
    }
    candlesConnection(interval: $interval, since: $since) {
      edges {
        node {
          volume
        }
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
            quoteName
            settlementAsset {
              id
              symbol
              name
            }
            oracleSpecForSettlementPrice {
              id
            }
            oracleSpecForTradingTermination {
              id
            }
            oracleSpecBinding {
              settlementPriceProperty
              tradingTerminationProperty
            }
          }
        }
      }
      riskModel {
        ... on LogNormalRiskModel {
          tau
          riskAversionParameter
          params {
            r
            sigma
            mu
          }
        }
        ... on SimpleRiskModel {
          params {
            factorLong
            factorShort
          }
        }
      }
    }
    depth {
      lastTrade {
        price
      }
    }
  }
}
    `;

/**
 * __useMarketInfoQueryQuery__
 *
 * To run a query within a React component, call `useMarketInfoQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketInfoQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketInfoQueryQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *      interval: // value for 'interval'
 *      since: // value for 'since'
 *   },
 * });
 */
export function useMarketInfoQueryQuery(baseOptions: Apollo.QueryHookOptions<MarketInfoQueryQuery, MarketInfoQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketInfoQueryQuery, MarketInfoQueryQueryVariables>(MarketInfoQueryDocument, options);
      }
export function useMarketInfoQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketInfoQueryQuery, MarketInfoQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketInfoQueryQuery, MarketInfoQueryQueryVariables>(MarketInfoQueryDocument, options);
        }
export type MarketInfoQueryQueryHookResult = ReturnType<typeof useMarketInfoQueryQuery>;
export type MarketInfoQueryLazyQueryHookResult = ReturnType<typeof useMarketInfoQueryLazyQuery>;
export type MarketInfoQueryQueryResult = Apollo.QueryResult<MarketInfoQueryQuery, MarketInfoQueryQueryVariables>;