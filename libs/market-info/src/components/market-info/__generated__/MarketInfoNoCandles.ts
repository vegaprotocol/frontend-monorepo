import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketInfoNoCandlesQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type MarketInfoNoCandlesQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, lpPriceRange: string, proposal?: { __typename?: 'Proposal', id?: string | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string } } | null, marketTimestamps: { __typename?: 'MarketTimestamps', open: any, close: any }, openingAuction: { __typename?: 'AuctionDuration', durationSecs: number, volume: number }, accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', id: string } } } | null> | null } | null, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string } }, priceMonitoringSettings: { __typename?: 'PriceMonitoringSettings', parameters?: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null } | null }, riskFactors?: { __typename?: 'RiskFactor', market: string, short: string, long: string } | null, data?: { __typename?: 'MarketData', markPrice: string, midPrice: string, bestBidVolume: string, bestOfferVolume: string, bestStaticBidVolume: string, bestStaticOfferVolume: string, bestBidPrice: string, bestOfferPrice: string, trigger: Types.AuctionTrigger, openInterest: string, suppliedStake?: string | null, targetStake?: string | null, marketValueProxy: string, market: { __typename?: 'Market', id: string }, priceMonitoringBounds?: Array<{ __typename?: 'PriceMonitoringBounds', minValidPrice: string, maxValidPrice: string, referencePrice: string, trigger: { __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number } }> | null } | null, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', triggeringRatio: string, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } }, riskModel: { __typename?: 'LogNormalRiskModel', tau: number, riskAversionParameter: number, params: { __typename?: 'LogNormalModelParams', r: number, sigma: number, mu: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } } }, depth: { __typename?: 'MarketDepth', lastTrade?: { __typename?: 'Trade', price: string } | null } } | null };


export const MarketInfoNoCandlesDocument = gql`
    query MarketInfoNoCandles($marketId: ID!) {
  market(id: $marketId) {
    id
    decimalPlaces
    positionDecimalPlaces
    state
    tradingMode
    lpPriceRange
    proposal {
      id
      rationale {
        title
        description
      }
    }
    marketTimestamps {
      open
      close
    }
    openingAuction {
      durationSecs
      volume
    }
    accountsConnection {
      edges {
        node {
          type
          asset {
            id
          }
          balance
        }
      }
    }
    tradingMode
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
    data {
      market {
        id
      }
      markPrice
      midPrice
      bestBidVolume
      bestOfferVolume
      bestStaticBidVolume
      bestStaticOfferVolume
      bestBidPrice
      bestOfferPrice
      trigger
      openInterest
      suppliedStake
      openInterest
      targetStake
      marketValueProxy
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
              decimals
            }
            dataSourceSpecForSettlementData {
              id
            }
            dataSourceSpecForTradingTermination {
              id
            }
            dataSourceSpecBinding {
              settlementDataProperty
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
 * __useMarketInfoNoCandlesQuery__
 *
 * To run a query within a React component, call `useMarketInfoNoCandlesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketInfoNoCandlesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketInfoNoCandlesQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useMarketInfoNoCandlesQuery(baseOptions: Apollo.QueryHookOptions<MarketInfoNoCandlesQuery, MarketInfoNoCandlesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketInfoNoCandlesQuery, MarketInfoNoCandlesQueryVariables>(MarketInfoNoCandlesDocument, options);
      }
export function useMarketInfoNoCandlesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketInfoNoCandlesQuery, MarketInfoNoCandlesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketInfoNoCandlesQuery, MarketInfoNoCandlesQueryVariables>(MarketInfoNoCandlesDocument, options);
        }
export type MarketInfoNoCandlesQueryHookResult = ReturnType<typeof useMarketInfoNoCandlesQuery>;
export type MarketInfoNoCandlesLazyQueryHookResult = ReturnType<typeof useMarketInfoNoCandlesLazyQuery>;
export type MarketInfoNoCandlesQueryResult = Apollo.QueryResult<MarketInfoNoCandlesQuery, MarketInfoNoCandlesQueryVariables>;