import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import { MarketCandlesFieldsFragmentDoc } from './market-candles';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketHookDataFragment = { __typename?: 'MarketData', bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, staticMidPrice: string, marketTradingMode: Types.MarketTradingMode, marketState: Types.MarketState, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string, targetStake?: string | null, suppliedStake?: string | null, auctionStart?: string | null, auctionEnd?: string | null, timestamp: any, market: { __typename?: 'Market', id: string } };

export type CandleFieldFragment = { __typename?: 'Candle', high: string, low: string, open: string, close: string, volume: string, periodStart: any };

export type MarketHookFragment = { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, data?: { __typename?: 'MarketData', bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, staticMidPrice: string, marketTradingMode: Types.MarketTradingMode, marketState: Types.MarketState, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string, targetStake?: string | null, suppliedStake?: string | null, auctionStart?: string | null, auctionEnd?: string | null, timestamp: any, market: { __typename?: 'Market', id: string } } | null, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string } }, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, decimals: number }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string } } } }, candlesConnection?: { __typename?: 'CandleDataConnection', edges?: Array<{ __typename?: 'CandleEdge', node: { __typename?: 'Candle', high: string, low: string, open: string, close: string, volume: string, periodStart: any } } | null> | null } | null, marketTimestamps: { __typename?: 'MarketTimestamps', open: any, close: any } };

export type MarketsHookQueryVariables = Types.Exact<{
  interval: Types.Interval;
  since: Types.Scalars['String'];
}>;


export type MarketsHookQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, data?: { __typename?: 'MarketData', bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, staticMidPrice: string, marketTradingMode: Types.MarketTradingMode, marketState: Types.MarketState, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string, targetStake?: string | null, suppliedStake?: string | null, auctionStart?: string | null, auctionEnd?: string | null, timestamp: any, market: { __typename?: 'Market', id: string } } | null, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string } }, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, decimals: number }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string } } } }, candlesConnection?: { __typename?: 'CandleDataConnection', edges?: Array<{ __typename?: 'CandleEdge', node: { __typename?: 'Candle', high: string, low: string, open: string, close: string, volume: string, periodStart: any } } | null> | null } | null, marketTimestamps: { __typename?: 'MarketTimestamps', open: any, close: any } } }> } | null };

export type MarketHookQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
  interval: Types.Interval;
  since: Types.Scalars['String'];
}>;


export type MarketHookQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, data?: { __typename?: 'MarketData', bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, staticMidPrice: string, marketTradingMode: Types.MarketTradingMode, marketState: Types.MarketState, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string, targetStake?: string | null, suppliedStake?: string | null, auctionStart?: string | null, auctionEnd?: string | null, timestamp: any, market: { __typename?: 'Market', id: string } } | null, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string } }, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, decimals: number }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string } } } }, candlesConnection?: { __typename?: 'CandleDataConnection', edges?: Array<{ __typename?: 'CandleEdge', node: { __typename?: 'Candle', high: string, low: string, open: string, close: string, volume: string, periodStart: any } } | null> | null } | null, marketTimestamps: { __typename?: 'MarketTimestamps', open: any, close: any } } | null };

export type ObservableMarketDataFieldsFragment = { __typename?: 'ObservableMarketData', marketId: string, bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, staticMidPrice: string, marketTradingMode: Types.MarketTradingMode, marketState: Types.MarketState, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string, targetStake?: string | null, suppliedStake?: string | null, auctionStart?: string | null, auctionEnd?: string | null, timestamp: any };

export type MarketsDataHookSubscriptionVariables = Types.Exact<{
  marketIds: Array<Types.Scalars['ID']> | Types.Scalars['ID'];
}>;


export type MarketsDataHookSubscription = { __typename?: 'Subscription', marketsData: Array<{ __typename?: 'ObservableMarketData', marketId: string, bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, staticMidPrice: string, marketTradingMode: Types.MarketTradingMode, marketState: Types.MarketState, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string, targetStake?: string | null, suppliedStake?: string | null, auctionStart?: string | null, auctionEnd?: string | null, timestamp: any }> };

export const CandleFieldFragmentDoc = gql`
    fragment CandleField on Candle {
  high
  low
  open
  close
  volume
  periodStart
}
    `;
export const MarketHookDataFragmentDoc = gql`
    fragment MarketHookData on MarketData {
  market {
    id
  }
  bestBidPrice
  bestOfferPrice
  markPrice
  trigger
  staticMidPrice
  marketTradingMode
  marketState
  indicativeVolume
  indicativePrice
  bestStaticBidPrice
  bestStaticOfferPrice
  targetStake
  suppliedStake
  auctionStart
  auctionEnd
  timestamp
}
    `;
export const MarketHookFragmentDoc = gql`
    fragment MarketHook on Market {
  id
  decimalPlaces
  positionDecimalPlaces
  state
  tradingMode
  data {
    ...MarketHookData
  }
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
            decimals
          }
          dataSourceSpecForTradingTermination {
            id
          }
          quoteName
        }
      }
    }
  }
  candlesConnection(interval: $interval, since: $since) {
    edges {
      node {
        ...MarketCandlesFields
      }
    }
  }
  marketTimestamps {
    open
    close
  }
}
    ${MarketHookDataFragmentDoc}
${MarketCandlesFieldsFragmentDoc}`;
export const ObservableMarketDataFieldsFragmentDoc = gql`
    fragment ObservableMarketDataFields on ObservableMarketData {
  marketId
  bestBidPrice
  bestOfferPrice
  markPrice
  trigger
  staticMidPrice
  marketTradingMode
  marketState
  indicativeVolume
  indicativePrice
  bestStaticBidPrice
  bestStaticOfferPrice
  targetStake
  suppliedStake
  auctionStart
  auctionEnd
  timestamp
}
    `;
export const MarketsHookDocument = gql`
    query MarketsHook($interval: Interval!, $since: String!) {
  marketsConnection {
    edges {
      node {
        ...MarketHook
      }
    }
  }
}
    ${MarketHookFragmentDoc}`;

/**
 * __useMarketsHookQuery__
 *
 * To run a query within a React component, call `useMarketsHookQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketsHookQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketsHookQuery({
 *   variables: {
 *      interval: // value for 'interval'
 *      since: // value for 'since'
 *   },
 * });
 */
export function useMarketsHookQuery(baseOptions: Apollo.QueryHookOptions<MarketsHookQuery, MarketsHookQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketsHookQuery, MarketsHookQueryVariables>(MarketsHookDocument, options);
      }
export function useMarketsHookLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketsHookQuery, MarketsHookQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketsHookQuery, MarketsHookQueryVariables>(MarketsHookDocument, options);
        }
export type MarketsHookQueryHookResult = ReturnType<typeof useMarketsHookQuery>;
export type MarketsHookLazyQueryHookResult = ReturnType<typeof useMarketsHookLazyQuery>;
export type MarketsHookQueryResult = Apollo.QueryResult<MarketsHookQuery, MarketsHookQueryVariables>;
export const MarketHookDocument = gql`
    query MarketHook($marketId: ID!, $interval: Interval!, $since: String!) {
  market(id: $marketId) {
    ...MarketHook
  }
}
    ${MarketHookFragmentDoc}`;

/**
 * __useMarketHookQuery__
 *
 * To run a query within a React component, call `useMarketHookQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketHookQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketHookQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *      interval: // value for 'interval'
 *      since: // value for 'since'
 *   },
 * });
 */
export function useMarketHookQuery(baseOptions: Apollo.QueryHookOptions<MarketHookQuery, MarketHookQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketHookQuery, MarketHookQueryVariables>(MarketHookDocument, options);
      }
export function useMarketHookLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketHookQuery, MarketHookQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketHookQuery, MarketHookQueryVariables>(MarketHookDocument, options);
        }
export type MarketHookQueryHookResult = ReturnType<typeof useMarketHookQuery>;
export type MarketHookLazyQueryHookResult = ReturnType<typeof useMarketHookLazyQuery>;
export type MarketHookQueryResult = Apollo.QueryResult<MarketHookQuery, MarketHookQueryVariables>;
export const MarketsDataHookDocument = gql`
    subscription MarketsDataHook($marketIds: [ID!]!) {
  marketsData(marketIds: $marketIds) {
    ...ObservableMarketDataFields
  }
}
    ${ObservableMarketDataFieldsFragmentDoc}`;

/**
 * __useMarketsDataHookSubscription__
 *
 * To run a query within a React component, call `useMarketsDataHookSubscription` and pass it any options that fit your needs.
 * When your component renders, `useMarketsDataHookSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketsDataHookSubscription({
 *   variables: {
 *      marketIds: // value for 'marketIds'
 *   },
 * });
 */
export function useMarketsDataHookSubscription(baseOptions: Apollo.SubscriptionHookOptions<MarketsDataHookSubscription, MarketsDataHookSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<MarketsDataHookSubscription, MarketsDataHookSubscriptionVariables>(MarketsDataHookDocument, options);
      }
export type MarketsDataHookSubscriptionHookResult = ReturnType<typeof useMarketsDataHookSubscription>;
export type MarketsDataHookSubscriptionResult = Apollo.SubscriptionResult<MarketsDataHookSubscription>;