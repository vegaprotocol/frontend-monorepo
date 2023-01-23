import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerMarketsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ExplorerMarketsQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', id: string, decimalPlaces: number, tradingMode: Types.MarketTradingMode, state: Types.MarketState, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string } }, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', settlementAsset: { __typename?: 'Asset', id: string, name: string, decimals: number, globalRewardPoolAccount?: { __typename?: 'AccountBalance', balance: string } | null } } }, riskModel: { __typename?: 'LogNormalRiskModel', tau: number, riskAversionParameter: number, params: { __typename?: 'LogNormalModelParams', r: number, sigma: number, mu: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } }, marginCalculator?: { __typename?: 'MarginCalculator', scalingFactors: { __typename?: 'ScalingFactors', searchLevel: number, initialMargin: number, collateralRelease: number } } | null }, openingAuction: { __typename?: 'AuctionDuration', durationSecs: number, volume: number }, priceMonitoringSettings: { __typename?: 'PriceMonitoringSettings', parameters?: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null } | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', triggeringRatio: string, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, proposal?: { __typename?: 'Proposal', id?: string | null } | null, accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', balance: string, type: Types.AccountType, asset: { __typename?: 'Asset', id: string, name: string } } } | null> | null } | null, data?: { __typename?: 'MarketData', markPrice: string, bestBidPrice: string, bestBidVolume: string, bestOfferPrice: string, bestOfferVolume: string, bestStaticBidPrice: string, bestStaticBidVolume: string, bestStaticOfferPrice: string, bestStaticOfferVolume: string, midPrice: string, staticMidPrice: string, timestamp: any, openInterest: string, auctionEnd?: string | null, auctionStart?: string | null, indicativePrice: string, indicativeVolume: string, trigger: Types.AuctionTrigger, extensionTrigger: Types.AuctionTrigger, targetStake?: string | null, suppliedStake?: string | null, marketValueProxy: string, priceMonitoringBounds?: Array<{ __typename?: 'PriceMonitoringBounds', minValidPrice: string, maxValidPrice: string, referencePrice: string, trigger: { __typename?: 'PriceMonitoringTrigger', auctionExtensionSecs: number, probability: number } }> | null, liquidityProviderFeeShare?: Array<{ __typename?: 'LiquidityProviderFeeShare', equityLikeShare: string, averageEntryValuation: string, party: { __typename?: 'Party', id: string } }> | null } | null } }> } | null };


export const ExplorerMarketsDocument = gql`
    query ExplorerMarkets {
  marketsConnection {
    edges {
      node {
        id
        fees {
          factors {
            makerFee
            infrastructureFee
            liquidityFee
          }
        }
        tradableInstrument {
          instrument {
            name
            metadata {
              tags
            }
            code
            product {
              ... on Future {
                settlementAsset {
                  id
                  name
                  decimals
                  globalRewardPoolAccount {
                    balance
                  }
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
          marginCalculator {
            scalingFactors {
              searchLevel
              initialMargin
              collateralRelease
            }
          }
        }
        decimalPlaces
        openingAuction {
          durationSecs
          volume
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
        liquidityMonitoringParameters {
          triggeringRatio
          targetStakeParameters {
            timeWindow
            scalingFactor
          }
        }
        tradingMode
        state
        proposal {
          id
        }
        state
        accountsConnection {
          edges {
            node {
              asset {
                id
                name
              }
              balance
              type
            }
          }
        }
        data {
          markPrice
          bestBidPrice
          bestBidVolume
          bestOfferPrice
          bestOfferVolume
          bestStaticBidPrice
          bestStaticBidVolume
          bestStaticOfferPrice
          bestStaticOfferVolume
          midPrice
          staticMidPrice
          timestamp
          openInterest
          auctionEnd
          auctionStart
          indicativePrice
          indicativeVolume
          trigger
          extensionTrigger
          targetStake
          suppliedStake
          priceMonitoringBounds {
            minValidPrice
            maxValidPrice
            trigger {
              auctionExtensionSecs
              probability
            }
            referencePrice
          }
          marketValueProxy
          liquidityProviderFeeShare {
            party {
              id
            }
            equityLikeShare
            averageEntryValuation
          }
        }
      }
    }
  }
}
    `;

/**
 * __useExplorerMarketsQuery__
 *
 * To run a query within a React component, call `useExplorerMarketsQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerMarketsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerMarketsQuery({
 *   variables: {
 *   },
 * });
 */
export function useExplorerMarketsQuery(baseOptions?: Apollo.QueryHookOptions<ExplorerMarketsQuery, ExplorerMarketsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerMarketsQuery, ExplorerMarketsQueryVariables>(ExplorerMarketsDocument, options);
      }
export function useExplorerMarketsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerMarketsQuery, ExplorerMarketsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerMarketsQuery, ExplorerMarketsQueryVariables>(ExplorerMarketsDocument, options);
        }
export type ExplorerMarketsQueryHookResult = ReturnType<typeof useExplorerMarketsQuery>;
export type ExplorerMarketsLazyQueryHookResult = ReturnType<typeof useExplorerMarketsLazyQuery>;
export type ExplorerMarketsQueryResult = Apollo.QueryResult<ExplorerMarketsQuery, ExplorerMarketsQueryVariables>;