import type { DealTicketQuery } from '@vegaprotocol/deal-ticket';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const generateDealTicketQuery = (
  override?: PartialDeep<DealTicketQuery>
): DealTicketQuery => {
  const defaultResult: DealTicketQuery = {
    market: {
      __typename: 'Market',
      id: 'market-0',
      name: 'ETHBTC Quarterly (30 Jun 2022)',
      decimalPlaces: 5,
      positionDecimalPlaces: 0,
      state: MarketState.Active,
      tradingMode: MarketTradingMode.Continuous,
      fees: {
        __typename: 'Fees',
        factors: {
          __typename: 'FeeFactors',
          makerFee: '0.0002',
          infrastructureFee: '0.0005',
          liquidityFee: '0.001',
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
          '99aaf48bbdb4368de634c17062cbce2f98ca85274d6ac93db8399973d95e1a1a',
        short: '0.008571790367285281',
        long: '0.008508132993273576',
      },
      data: {
        __typename: 'MarketData',
        market: {
          __typename: 'Market',
          id: '99aaf48bbdb4368de634c17062cbce2f98ca85274d6ac93db8399973d95e1a1a',
        },
        markPrice: '5326',
        indicativeVolume: '0',
        bestBidVolume: '0',
        bestOfferVolume: '0',
        bestStaticBidVolume: '0',
        bestStaticOfferVolume: '0',
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
          price: '5483',
        },
      },
    },
  };

  return merge(defaultResult, override);
};
