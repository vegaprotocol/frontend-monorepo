import type { MarketInfoQuery } from './__generated__/MarketInfo';
import * as Schema from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const marketInfoQuery = (
  override?: PartialDeep<MarketInfoQuery>
): MarketInfoQuery => {
  const defaultResult: MarketInfoQuery = {
    market: {
      __typename: 'Market',
      id: 'market-0',
      decimalPlaces: 5,
      positionDecimalPlaces: 0,
      state: Schema.MarketState.STATE_ACTIVE,
      tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
      proposal: {
        __typename: 'Proposal',
        id: 'market-0',
        rationale: {
          __typename: 'ProposalRationale',
          title: 'ETHBTC',
          description: '',
        },
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: '2022-11-15T02:15:24.543614154Z',
        close: null,
      },
      openingAuction: {
        __typename: 'AuctionDuration',
        durationSecs: 210,
        volume: 0,
      },
      accountsConnection: {
        __typename: 'AccountsConnection',
        edges: [
          {
            __typename: 'AccountEdge',
            node: {
              type: Schema.AccountType.ACCOUNT_TYPE_INSURANCE,
              asset: {
                id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
                __typename: 'Asset',
              },
              balance: '0',
              __typename: 'AccountBalance',
            },
          },
          {
            __typename: 'AccountEdge',
            node: {
              type: Schema.AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY,
              asset: {
                id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
                __typename: 'Asset',
              },
              balance: '0',
              __typename: 'AccountBalance',
            },
          },
        ],
      },
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
        suppliedStake: '56767',
        marketValueProxy: '677678',
        targetStake: '56789',
        bestBidVolume: '5',
        bestOfferVolume: '1',
        bestStaticBidVolume: '5',
        bestStaticOfferVolume: '1',
        openInterest: '0',
        bestBidPrice: '681765',
        bestOfferPrice: '681769',
        trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED,
        priceMonitoringBounds: [
          {
            minValidPrice: '654701',
            maxValidPrice: '797323',
            trigger: {
              horizonSecs: 43200,
              probability: 0.9999999,
              auctionExtensionSecs: 600,
              __typename: 'PriceMonitoringTrigger',
            },
            referencePrice: '722625',
            __typename: 'PriceMonitoringBounds',
          },
        ],
      },
      liquidityMonitoringParameters: {
        triggeringRatio: 0,
        targetStakeParameters: {
          timeWindow: 3600,
          scalingFactor: 10,
          __typename: 'TargetStakeParameters',
        },
        __typename: 'LiquidityMonitoringParameters',
      },
      candlesConnection: null,
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
          name: 'BTCUSD Monthly (30 Jun 2022)',
          code: 'BTCUSD.MF21',
          metadata: {
            tags: [
              'formerly: 076BB86A5AA41E3E',
              'base: BTC',
              'quote: USD',
              'class: fx/crypto',
              'monthly',
              'sector :crypto',
            ],
            __typename: 'InstrumentMetadata',
          },
          product: {
            __typename: 'Future',
            quoteName: 'BTC',
            settlementAsset: {
              __typename: 'Asset',
              id: 'market-0',
              symbol: 'tBTC',
              name: 'tBTC TEST',
              decimals: 5,
            },
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: 'f028fe5ea7de3890962a05a7163fdde562629af649ed81b8c8902fafb6eef04f',
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: 'f028fe5ea7de3890962a05a7163fdde562629af649ed81b8c8902fafb6eef04f',
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty: 'prices.BTC.value',
              tradingTerminationProperty: 'termination.BTC.value',
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
