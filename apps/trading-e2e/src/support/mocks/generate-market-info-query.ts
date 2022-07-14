import type { MarketInfoQuery } from '@vegaprotocol/deal-ticket';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const generateMarketInfoQuery = (
  override?: PartialDeep<MarketInfoQuery>
): MarketInfoQuery => {
  const defaultResult: MarketInfoQuery = {
    market: {
      __typename: 'Market',
      id: 'market-0',
      name: 'ETHBTC Quarterly (30 Jun 2022)',
      decimalPlaces: 2,
      positionDecimalPlaces: 0,
      state: MarketState.Active,
      tradingMode: MarketTradingMode.Continuous,
      fees: {
        __typename: 'Fees',
        factors: {
          __typename: 'FeeFactors',
          makerFee: '0.0002',
          infrastructureFee: '0.0005',
          liquidityFee: '0.01',
        },
      },
      priceMonitoringSettings: {
        __typename: 'PriceMonitoringSettings',
        parameters: {
          __typename: 'PriceMonitoringParameters',
          triggers: [
            {
              __typename: 'PriceMonitoringTrigger',
              horizonSecs: 43200,
              probability: 0.9999999,
              auctionExtensionSecs: 600,
            },
          ],
        },
        updateFrequencySecs: 1,
      },
      riskFactors: {
        __typename: 'RiskFactor',
        market:
          '54b78c1b877e106842ae156332ccec740ad98d6bad43143ac6a029501dd7c6e0',
        short: '0.008571790367285281',
        long: '0.008508132993273576',
      },
      data: {
        __typename: 'MarketData',
        market: {
          __typename: 'Market',
          id: '54b78c1b877e106842ae156332ccec740ad98d6bad43143ac6a029501dd7c6e0',
        },
        markPrice: '5749',
        indicativeVolume: '0',
        bestBidVolume: '5',
        bestOfferVolume: '1',
        bestStaticBidVolume: '5',
        bestStaticOfferVolume: '1',
      },
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          product: {
            __typename: 'Future',
            quoteName: 'BTC',
            settlementAsset: {
              __typename: 'Asset',
              id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
              symbol: 'tBTC',
              name: 'tBTC TEST',
            },
          },
        },
        riskModel: {
          __typename: 'LogNormalRiskModel',
          tau: 0.0001140771161,
          riskAversionParameter: 0.01,
          params: {
            __typename: 'LogNormalModelParams',
            r: 0.016,
            sigma: 0.3,
            mu: 0,
          },
        },
      },
      depth: {
        __typename: 'MarketDepth',
        lastTrade: {
          __typename: 'Trade',
          price: '100',
        },
      },
    },
  };

  return merge(defaultResult, override);
};
