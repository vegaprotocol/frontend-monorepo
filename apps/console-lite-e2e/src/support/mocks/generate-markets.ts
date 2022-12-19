import merge from 'lodash/merge';
import * as Schema from '@vegaprotocol/types';
import type {
  MarketsQuery,
  Market,
  MarketsCandlesQuery,
  Candle,
  MarketsDataQuery,
  MarketDataFieldsFragment,
} from '@vegaprotocol/market-list';
import { protoMarket, protoCandles, singleMarket } from './commons';
import type { PartialDeep } from 'type-fest';
import type { MarketQuery } from '@vegaprotocol/market-list';
import type { MarketDataQuery } from '@vegaprotocol/market-list';

export const generateSimpleMarkets = (): MarketsQuery => {
  const markets: Market[] = [
    { ...protoMarket },
    {
      ...protoMarket,
      id: '57fbaa322e97cfc8bb5f1de048c37e033c41b1ac1906d3aed9960912a067ef5a',
      state: Schema.MarketState.STATE_ACTIVE,
      tradableInstrument: {
        instrument: {
          id: '',
          code: 'CELUSD',
          name: 'CELUSD (June 2022)',
          metadata: {
            tags: [
              'base:CEL',
              'quote:USD',
              'class:fx/crypto',
              'ad-hoc',
              'sector:crypto',
            ],
            __typename: 'InstrumentMetadata',
          },
          product: {
            __typename: 'Future',
            quoteName: 'USD',
            settlementAsset: {
              __typename: 'Asset',
              id: 'asset-XYZalpha',
              symbol: 'XYZalpha',
              decimals: 5,
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
    {
      ...protoMarket,
      id: 'ccf2f04865e5951ac3405da6e16b7cbdb535a0ad32df4df2dbed4262cf473255',
      state: Schema.MarketState.STATE_SUSPENDED,
      tradableInstrument: {
        instrument: {
          id: '',
          code: 'XMRUSD',
          name: 'XMRUSD market',
          metadata: {
            tags: [
              'base:monero',
              'quote:usd',
              'class:fx/crypto',
              'ad-hoc',
              'sector:crypto',
            ],
            __typename: 'InstrumentMetadata',
          },
          product: {
            __typename: 'Future',
            quoteName: 'USD',
            settlementAsset: {
              __typename: 'Asset',
              id: 'asset-XYZbeta',
              symbol: 'XYZbeta',
              decimals: 5,
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
    {
      ...protoMarket,
      id: '6030e5b4e0ca3297a26081e5af4d453f97f96baab2d74bf56f84efcffc4c382f',
      state: Schema.MarketState.STATE_ACTIVE,
      tradableInstrument: {
        instrument: {
          id: '',
          code: 'UNIDAI.MF21',
          name: 'UNIDAI Monthly (30 Jun 2022)',
          metadata: {
            tags: [
              'formerly:3C58ED2A4A6C5D7E',
              'base:UNI',
              'quote:DAI',
              'class:fx/crypto',
              'monthly',
              'sector:defi',
            ],
            __typename: 'InstrumentMetadata',
          },
          product: {
            __typename: 'Future',
            quoteName: 'DAI',
            settlementAsset: {
              __typename: 'Asset',
              id: 'asset-tDAI',
              symbol: 'tDAI',
              decimals: 5,
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
    {
      ...protoMarket,
      id: 'de74a5572045b300e8ec50d136896912ec76e7d7ec135bc305dfd4854d9363a4',
      state: Schema.MarketState.STATE_PENDING,
      tradableInstrument: {
        instrument: {
          id: '',
          code: 'XMRUSD',
          name: 'XMRUSD market',
          metadata: {
            tags: [
              'base:monero',
              'quote:usd',
              'class:fx/crypto',
              'ad-hoc',
              'sector:crypto',
            ],
            __typename: 'InstrumentMetadata',
          },
          product: {
            __typename: 'Future',
            quoteName: 'USD',
            settlementAsset: {
              __typename: 'Asset',
              id: 'asset-XYZbeta',
              symbol: 'XYZbeta',
              decimals: 5,
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
    {
      ...protoMarket,
      id: '31ea96284611771e486c820acb26a325a99664f9854b5a7e7ad99023efa8f9e6',
      state: Schema.MarketState.STATE_CLOSED,
      tradableInstrument: {
        instrument: {
          id: '',
          code: 'APE/USD',
          name: 'ApeCoin (18 Jul 2022)',
          metadata: {
            tags: [
              'quote:USD',
              'ticker:APE',
              'class:equities/single-stock-futures',
              'sector:tech',
            ],
            __typename: 'InstrumentMetadata',
          },
          product: {
            __typename: 'Future',
            quoteName: 'USD',
            settlementAsset: {
              __typename: 'Asset',
              id: 'asset-tUSDC',
              symbol: 'tUSDC',
              decimals: 5,
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
    {
      ...protoMarket,
      id: '34cff959cdc2ffdb0f167820d701fe8b51cc6b8588e650d93369aaa22d6f8b74',
      state: Schema.MarketState.STATE_SETTLED,
      tradableInstrument: {
        instrument: {
          id: '',
          code: 'BTCUSD.MF21',
          name: 'BTCUSD Monthly (18 Jul 2022)',
          metadata: {
            tags: [
              'formerly:076BB86A5AA41E3E',
              'base:BTC',
              'quote:USD',
              'class:fx/crypto',
              'monthly',
              'sector:crypto',
            ],
            __typename: 'InstrumentMetadata',
          },
          product: {
            __typename: 'Future',
            quoteName: 'USD',
            settlementAsset: {
              __typename: 'Asset',
              id: 'asset-tBTC',
              symbol: 'tBTC',
              decimals: 5,
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
    {
      ...protoMarket,
      id: '87b0bbb3c171baa5d97dfc3852332829c91e5c5dc9f7c8fb584c6d8ac75aaaf2',
      state: Schema.MarketState.STATE_SETTLED,
      tradableInstrument: {
        instrument: {
          id: '',
          code: 'LTCUSD',
          name: 'Builders Club x ETHcc',
          metadata: {
            tags: [
              'base:litecoin',
              'quote:usd',
              'class:fx/crypto',
              'ad-hoc',
              'sector:crypto',
            ],
            __typename: 'InstrumentMetadata',
          },
          product: {
            __typename: 'Future',
            quoteName: 'USD',
            settlementAsset: {
              __typename: 'Asset',
              id: 'asset-XYZgamma',
              symbol: 'XYZgamma',
              decimals: 5,
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
    {
      ...protoMarket,
      id: '45266143c6e9b58f4cff9b8906e971c531bb29ea7af01066973f9b77e8134823',
      state: Schema.MarketState.STATE_PENDING,
      tradableInstrument: {
        instrument: {
          id: '',
          code: 'BTCUSD.MF21',
          name: 'BTCUSD Monthly (18 Jul 2022)',
          metadata: {
            tags: [
              'formerly:076BB86A5AA41E3E',
              'base:BTC',
              'quote:USD',
              'class:fx/crypto',
              'monthly',
              'sector:crypto',
            ],
            __typename: 'InstrumentMetadata',
          },
          product: {
            __typename: 'Future',
            quoteName: 'USD',
            settlementAsset: {
              __typename: 'Asset',
              id: 'asset-tBTC',
              symbol: 'tBTC',
              decimals: 5,
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
    {
      ...protoMarket,
      id: '65663ebdc96161162769c4d5c5508137416748178d7cb28e2cb0d07a151a2bc6',
      state: Schema.MarketState.STATE_ACTIVE,
      tradableInstrument: {
        instrument: {
          id: '',
          code: 'ETHBTC.QM21',
          name: 'ETHBTC Quarterly (30 Jun 2022)',
          metadata: {
            tags: [
              'formerly:1F0BB6EB5703B099',
              'base:ETH',
              'quote:BTC',
              'class:fx/crypto',
              'quarterly',
              'sector:crypto',
            ],
            __typename: 'InstrumentMetadata',
          },
          product: {
            __typename: 'Future',
            quoteName: 'BTC',
            settlementAsset: {
              __typename: 'Asset',
              id: 'asset-tBTC',
              symbol: 'tBTC',
              decimals: 5,
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
    {
      ...protoMarket,
      id: '234afabd27e3bce1a879039c041f9f00f915d98459935ddafd0169d38dd13850',
      state: Schema.MarketState.STATE_ACTIVE,
      tradableInstrument: {
        instrument: {
          id: '',
          code: 'AAPL.MF21',
          name: 'Apple Monthly (30 Jun 2022)',
          metadata: {
            tags: [
              'formerly:4899E01009F1A721',
              'quote:USD',
              'ticker:AAPL',
              'class:equities/single-stock-futures',
              'sector:tech',
              'listing_venue:NASDAQ',
              'country:US',
            ],
            __typename: 'InstrumentMetadata',
          },
          product: {
            __typename: 'Future',
            quoteName: 'USD',
            settlementAsset: {
              __typename: 'Asset',
              id: 'asset-tUSDC',
              symbol: 'tUSDC',
              decimals: 5,
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
    {
      ...protoMarket,
      id: '9f2a3c1caa67bb0773ec18d908d32b55b129b9ec2d106a8e9a87f6aa5c0375a6',
      state: Schema.MarketState.STATE_ACTIVE,
      tradableInstrument: {
        instrument: {
          id: '',
          code: 'TSLA.QM21',
          name: 'Tesla Quarterly (30 Jun 2022)',
          metadata: {
            tags: [
              'formerly:5A86B190C384997F',
              'quote:EURO',
              'ticker:TSLA',
              'class:equities/single-stock-futures',
              'sector:tech',
              'listing_venue:NASDAQ',
              'country:US',
            ],
            __typename: 'InstrumentMetadata',
          },
          product: {
            __typename: 'Future',
            quoteName: 'EURO',
            settlementAsset: {
              __typename: 'Asset',
              id: 'asset-tEURO',
              symbol: 'tEURO',
              decimals: 5,
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
    {
      ...protoMarket,
      id: '8a45ee934d3ddac4b036f9884df1064a5353c620a56f775ba36597d0edef9a7a',
      state: Schema.MarketState.STATE_ACTIVE,
      tradableInstrument: {
        instrument: {
          id: '',
          code: 'LTCUSD',
          name: 'Go big or Go home',
          metadata: {
            tags: [
              'base:litecoin',
              'quote:usd',
              'class:fx/crypto',
              'ad-hoc',
              'sector:crypto',
            ],
            __typename: 'InstrumentMetadata',
          },
          product: {
            __typename: 'Future',
            quoteName: 'USD',
            settlementAsset: {
              __typename: 'Asset',
              id: 'asset-XYZgamma',
              symbol: 'XYZgamma',
              decimals: 5,
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
    {
      ...protoMarket,
      id: 'aede7b9ac0c3b225004929c5455160a00f59864aad32ec366e8a2bff1b30fd0f',
      state: Schema.MarketState.STATE_ACTIVE,
      tradableInstrument: {
        instrument: {
          id: '',
          code: 'BTCUSD.MF21',
          name: 'BTCUSD Monthly (08 Jul 2022)',
          metadata: {
            tags: [
              'formerly:076BB86A5AA41E3E',
              'base:BTC',
              'quote:USD',
              'class:fx/crypto',
              'monthly',
              'sector:crypto',
            ],
            __typename: 'InstrumentMetadata',
          },
          product: {
            __typename: 'Future',
            quoteName: 'USD',
            settlementAsset: {
              __typename: 'Asset',
              id: 'asset-tBTC',
              symbol: 'tBTC',
              decimals: 5,
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
    {
      ...protoMarket,
      id: '9398707e01daa1a1f1ca6ff87cf8d6c03fe7373ce31121ce81b99a129e6bda47',
      state: Schema.MarketState.STATE_ACTIVE,
      tradableInstrument: {
        instrument: {
          id: '',
          code: 'BTCUSD.MF21',
          name: 'BTCUSD Monthly (18 Jul 2022)',
          metadata: {
            tags: [
              'formerly:076BB86A5AA41E3E',
              'base:BTC',
              'quote:USD',
              'class:fx/crypto',
              'monthly',
              'sector:crypto',
            ],
            __typename: 'InstrumentMetadata',
          },
          product: {
            __typename: 'Future',
            quoteName: 'USD',
            settlementAsset: {
              __typename: 'Asset',
              id: 'asset-tBTC',
              symbol: 'tBTC',
              decimals: 5,
            },
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
  ];
  return {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: markets.map((node) => ({
        __typename: 'MarketEdge',
        node,
      })),
    },
  };
};

export const generateMarketsCandles = (): MarketsCandlesQuery => {
  return {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: [
        {
          __typename: 'MarketEdge',
          node: {
            id: protoMarket.id,
            __typename: 'Market',
            candlesConnection: {
              __typename: 'CandleDataConnection',
              edges: protoCandles.map((node) => ({
                __typename: 'CandleEdge',
                node: node as unknown as Candle,
              })),
            },
          },
        },
        {
          __typename: 'MarketEdge',
          node: {
            id: '6030e5b4e0ca3297a26081e5af4d453f97f96baab2d74bf56f84efcffc4c382f',
            __typename: 'Market',
            candlesConnection: {
              __typename: 'CandleDataConnection',
              edges: [
                { open: '723082', close: '726800', __typename: 'Candle' },
                {
                  open: '726800',
                  close: '733551',
                  __typename: 'Candle',
                },
                { open: '733557', close: '719960', __typename: 'Candle' },
                {
                  open: '719961',
                  close: '707711',
                  __typename: 'Candle',
                },
                { open: '702459', close: '705275', __typename: 'Candle' },
                {
                  open: '701609',
                  close: '698494',
                  __typename: 'Candle',
                },
                { open: '698494', close: '702201', __typename: 'Candle' },
                {
                  open: '704749',
                  close: '704248',
                  __typename: 'Candle',
                },
                { open: '708562', close: '714712', __typename: 'Candle' },
                {
                  open: '718434',
                  close: '732567',
                  __typename: 'Candle',
                },
                { open: '732567', close: '750475', __typename: 'Candle' },
                {
                  open: '768916',
                  close: '746371',
                  __typename: 'Candle',
                },
                { open: '740240', close: '744910', __typename: 'Candle' },
                {
                  open: '746902',
                  close: '731680',
                  __typename: 'Candle',
                },
                { open: '730156', close: '729021', __typename: 'Candle' },
                {
                  open: '730503',
                  close: '738096',
                  __typename: 'Candle',
                },
                { open: '738096', close: '743087', __typename: 'Candle' },
                {
                  open: '739244',
                  close: '732352',
                  __typename: 'Candle',
                },
                { open: '732352', close: '751259', __typename: 'Candle' },
                {
                  open: '751259',
                  close: '751455',
                  __typename: 'Candle',
                },
                { open: '751455', close: '753990', __typename: 'Candle' },
                {
                  open: '757174',
                  close: '761100',
                  __typename: 'Candle',
                },
                { open: '758974', close: '759379', __typename: 'Candle' },
                {
                  open: '762834',
                  close: '761777',
                  __typename: 'Candle',
                },
              ].map((node) => ({
                __typename: 'CandleEdge',
                node: node as unknown as Candle,
              })),
            },
          },
        },
        {
          __typename: 'MarketEdge',
          node: {
            id: 'de74a5572045b300e8ec50d136896912ec76e7d7ec135bc305dfd4854d9363a4',
            __typename: 'Market',
            candlesConnection: {
              __typename: 'CandleDataConnection',
              edges: [
                { open: '14602', close: '14596', __typename: 'Candle' },
                {
                  open: '14596',
                  close: '14731',
                  __typename: 'Candle',
                },
                { open: '14732', close: '14592', __typename: 'Candle' },
                {
                  open: '14592',
                  close: '14516',
                  __typename: 'Candle',
                },
                { open: '14516', close: '14179', __typename: 'Candle' },
                {
                  open: '14179',
                  close: '14031',
                  __typename: 'Candle',
                },
                { open: '14032', close: '14115', __typename: 'Candle' },
                {
                  open: '14116',
                  close: '14166',
                  __typename: 'Candle',
                },
                { open: '14166', close: '14377', __typename: 'Candle' },
                {
                  open: '14377',
                  close: '14714',
                  __typename: 'Candle',
                },
                { open: '14713', close: '14593', __typename: 'Candle' },
                {
                  open: '14594',
                  close: '14273',
                  __typename: 'Candle',
                },
                { open: '14272', close: '14245', __typename: 'Candle' },
                {
                  open: '14244',
                  close: '14337',
                  __typename: 'Candle',
                },
                { open: '14338', close: '14384', __typename: 'Candle' },
                {
                  open: '14385',
                  close: '14257',
                  __typename: 'Candle',
                },
                { open: '14256', close: '14105', __typename: 'Candle' },
                {
                  open: '14106',
                  close: '14067',
                  __typename: 'Candle',
                },
                { open: '14066', close: '14196', __typename: 'Candle' },
                {
                  open: '14197',
                  close: '14316',
                  __typename: 'Candle',
                },
                { open: '14315', close: '14377', __typename: 'Candle' },
                {
                  open: '14378',
                  close: '14106',
                  __typename: 'Candle',
                },
                { open: '14105', close: '14317', __typename: 'Candle' },
                {
                  open: '14318',
                  close: '14467',
                  __typename: 'Candle',
                },
              ].map((node) => ({
                __typename: 'CandleEdge',
                node: node as unknown as Candle,
              })),
            },
          },
        },
        {
          __typename: 'MarketEdge',
          node: {
            id: '87b0bbb3c171baa5d97dfc3852332829c91e5c5dc9f7c8fb584c6d8ac75aaaf2',
            __typename: 'Market',
            candlesConnection: {
              __typename: 'CandleDataConnection',
              edges: [
                { open: '5700', close: '5688', __typename: 'Candle' },
                {
                  open: '5688',
                  close: '5644',
                  __typename: 'Candle',
                },
                { open: '5644', close: '5664', __typename: 'Candle' },
                {
                  open: '5664',
                  close: '5694',
                  __typename: 'Candle',
                },
                { open: '5694', close: '5751', __typename: 'Candle' },
                {
                  open: '5751',
                  close: '5853',
                  __typename: 'Candle',
                },
                { open: '5853', close: '5773', __typename: 'Candle' },
                {
                  open: '5773',
                  close: '5697',
                  __typename: 'Candle',
                },
                { open: '5697', close: '5683', __typename: 'Candle' },
                {
                  open: '5683',
                  close: '5655',
                  __typename: 'Candle',
                },
                { open: '5655', close: '5674', __typename: 'Candle' },
                {
                  open: '5674',
                  close: '5705',
                  __typename: 'Candle',
                },
                { open: '5705', close: '5648', __typename: 'Candle' },
                {
                  open: '5648',
                  close: '5646',
                  __typename: 'Candle',
                },
                { open: '5646', close: '5687', __typename: 'Candle' },
                {
                  open: '5687',
                  close: '5675',
                  __typename: 'Candle',
                },
                { open: '5675', close: '5696', __typename: 'Candle' },
                {
                  open: '5696',
                  close: '5699',
                  __typename: 'Candle',
                },
                { open: '5699', close: '5731', __typename: 'Candle' },
                {
                  open: '5731',
                  close: '5768',
                  __typename: 'Candle',
                },
              ].map((node) => ({
                __typename: 'CandleEdge',
                node: node as unknown as Candle,
              })),
            },
          },
        },
        {
          __typename: 'MarketEdge',
          node: {
            id: '65663ebdc96161162769c4d5c5508137416748178d7cb28e2cb0d07a151a2bc6',
            __typename: 'Market',
            candlesConnection: {
              __typename: 'CandleDataConnection',
              edges: [
                { open: '6680', close: '6600', __typename: 'Candle' },
                {
                  open: '6600',
                  close: '6630',
                  __typename: 'Candle',
                },
                { open: '6630', close: '6677', __typename: 'Candle' },
                {
                  open: '6735',
                  close: '6720',
                  __typename: 'Candle',
                },
                { open: '6720', close: '6691', __typename: 'Candle' },
                {
                  open: '6681',
                  close: '6730',
                  __typename: 'Candle',
                },
                { open: '6756', close: '6778', __typename: 'Candle' },
                {
                  open: '6778',
                  close: '6768',
                  __typename: 'Candle',
                },
                { open: '6768', close: '6834', __typename: 'Candle' },
                {
                  open: '6834',
                  close: '7001',
                  __typename: 'Candle',
                },
                { open: '7001', close: '6894', __typename: 'Candle' },
                {
                  open: '6910',
                  close: '6867',
                  __typename: 'Candle',
                },
                { open: '6867', close: '6827', __typename: 'Candle' },
                {
                  open: '6899',
                  close: '6910',
                  __typename: 'Candle',
                },
                { open: '6868', close: '6902', __typename: 'Candle' },
                {
                  open: '6905',
                  close: '6947',
                  __typename: 'Candle',
                },
                { open: '6932', close: '6900', __typename: 'Candle' },
                {
                  open: '6900',
                  close: '6911',
                  __typename: 'Candle',
                },
                { open: '6936', close: '6948', __typename: 'Candle' },
                {
                  open: '6936',
                  close: '6946',
                  __typename: 'Candle',
                },
                { open: '6946', close: '6906', __typename: 'Candle' },
                {
                  open: '6947',
                  close: '6962',
                  __typename: 'Candle',
                },
                { open: '6962', close: '7027', __typename: 'Candle' },
                {
                  open: '6941',
                  close: '6921',
                  __typename: 'Candle',
                },
              ].map((node) => ({
                __typename: 'CandleEdge',
                node: node as unknown as Candle,
              })),
            },
          },
        },
        {
          __typename: 'MarketEdge',
          node: {
            id: '234afabd27e3bce1a879039c041f9f00f915d98459935ddafd0169d38dd13850',
            __typename: 'Market',
            candlesConnection: {
              __typename: 'CandleDataConnection',
              edges: [
                { open: '15126319', close: '15087482', __typename: 'Candle' },
                {
                  open: '15087482',
                  close: '15119759',
                  __typename: 'Candle',
                },
                { open: '15119759', close: '15061361', __typename: 'Candle' },
                {
                  open: '15061361',
                  close: '14742622',
                  __typename: 'Candle',
                },
                { open: '14742622', close: '14735571', __typename: 'Candle' },
                {
                  open: '14735571',
                  close: '14694437',
                  __typename: 'Candle',
                },
                { open: '14694437', close: '14670479', __typename: 'Candle' },
                {
                  open: '14670479',
                  close: '14624796',
                  __typename: 'Candle',
                },
                { open: '14621001', close: '14722835', __typename: 'Candle' },
                {
                  open: '14722835',
                  close: '14705183',
                  __typename: 'Candle',
                },
                { open: '14705183', close: '14710797', __typename: 'Candle' },
                {
                  open: '14710796',
                  close: '14713874',
                  __typename: 'Candle',
                },
                { open: '14713874', close: '14677982', __typename: 'Candle' },
                {
                  open: '14677982',
                  close: '14710031',
                  __typename: 'Candle',
                },
                { open: '14751685', close: '14737556', __typename: 'Candle' },
                {
                  open: '14737556',
                  close: '14769139',
                  __typename: 'Candle',
                },
                { open: '14760616', close: '14761691', __typename: 'Candle' },
                {
                  open: '14761691',
                  close: '14714380',
                  __typename: 'Candle',
                },
                { open: '14714380', close: '14740160', __typename: 'Candle' },
                {
                  open: '14740160',
                  close: '14764832',
                  __typename: 'Candle',
                },
                { open: '14764832', close: '14778059', __typename: 'Candle' },
                {
                  open: '14761936',
                  close: '14707831',
                  __typename: 'Candle',
                },
                { open: '14707831', close: '14753272', __typename: 'Candle' },
                {
                  open: '14753272',
                  close: '14771411',
                  __typename: 'Candle',
                },
              ].map((node) => ({
                __typename: 'CandleEdge',
                node: node as unknown as Candle,
              })),
            },
          },
        },
        {
          __typename: 'MarketEdge',
          node: {
            id: '9f2a3c1caa67bb0773ec18d908d32b55b129b9ec2d106a8e9a87f6aa5c0375a6',
            __typename: 'Market',
            candlesConnection: {
              __typename: 'CandleDataConnection',
              edges: [
                { open: '71263667', close: '71173749', __typename: 'Candle' },
                {
                  open: '71173749',
                  close: '71055959',
                  __typename: 'Candle',
                },
                { open: '71055959', close: '71078605', __typename: 'Candle' },
                {
                  open: '71078605',
                  close: '69838205',
                  __typename: 'Candle',
                },
                { open: '69838205', close: '69166023', __typename: 'Candle' },
                {
                  open: '69166023',
                  close: '68841759',
                  __typename: 'Candle',
                },
                { open: '68841759', close: '68711290', __typename: 'Candle' },
                {
                  open: '68711290',
                  close: '68650154',
                  __typename: 'Candle',
                },
                { open: '68644289', close: '68638322', __typename: 'Candle' },
                {
                  open: '68704232',
                  close: '68343581',
                  __typename: 'Candle',
                },
                { open: '67345721', close: '67554701', __typename: 'Candle' },
                {
                  open: '67533143',
                  close: '67551571',
                  __typename: 'Candle',
                },
                { open: '67533286', close: '67543539', __typename: 'Candle' },
                {
                  open: '67580208',
                  close: '67472337',
                  __typename: 'Candle',
                },
                { open: '67416289', close: '67459697', __typename: 'Candle' },
                {
                  open: '67396085',
                  close: '67528265',
                  __typename: 'Candle',
                },
                { open: '67491799', close: '67538833', __typename: 'Candle' },
                {
                  open: '67493210',
                  close: '67362908',
                  __typename: 'Candle',
                },
                { open: '67362908', close: '67518182', __typename: 'Candle' },
                {
                  open: '67518182',
                  close: '67635775',
                  __typename: 'Candle',
                },
                { open: '67635775', close: '67734861', __typename: 'Candle' },
                {
                  open: '67714943',
                  close: '67736742',
                  __typename: 'Candle',
                },
                { open: '67716074', close: '67690826', __typename: 'Candle' },
                {
                  open: '67714352',
                  close: '67817444',
                  __typename: 'Candle',
                },
              ].map((node) => ({
                __typename: 'CandleEdge',
                node: node as unknown as Candle,
              })),
            },
          },
        },
        {
          __typename: 'MarketEdge',
          node: {
            id: '8a45ee934d3ddac4b036f9884df1064a5353c620a56f775ba36597d0edef9a7a',
            __typename: 'Market',
            candlesConnection: {
              __typename: 'CandleDataConnection',
              edges: [
                { open: '5809', close: '5795', __typename: 'Candle' },
                {
                  open: '5795',
                  close: '5845',
                  __typename: 'Candle',
                },
                { open: '5845', close: '5779', __typename: 'Candle' },
                {
                  open: '5779',
                  close: '5710',
                  __typename: 'Candle',
                },
                { open: '5710', close: '5691', __typename: 'Candle' },
              ].map((node) => ({
                __typename: 'CandleEdge',
                node: node as unknown as Candle,
              })),
            },
          },
        },
      ],
    },
  };
};

export const generateEmptyMarketsData = (): MarketsDataQuery => {
  return {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: [],
    },
  };
};

export const generateLongListMarkets = (count: number) => {
  const markets = [];
  for (let i = 0; i < count; i++) {
    markets.push({
      ...protoMarket,
      id: protoMarket.id + i,
      tradableInstrument: {
        ...protoMarket.tradableInstrument,
        instrument: {
          ...protoMarket.tradableInstrument.instrument,
          name: protoMarket.tradableInstrument.instrument.name + i,
        },
      },
    });
  }
  return {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: markets.map((node) => ({
        __typename: 'MarketEdge',
        node,
      })),
    },
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateMarkets = (override?: any): MarketsQuery => {
  const markets = [protoMarket];

  const defaultResult = {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: markets.map((node) => ({
        __typename: 'MarketEdge',
        node,
      })),
    },
  };

  return merge(defaultResult, override);
};

export const generateFillsMarkets = () => {
  const marketIds = ['market-0', 'market-1', 'market-2', 'market-4'];
  return {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: marketIds.map((id) => ({
        __typename: 'MarketEdge',
        node: { ...protoMarket, id },
      })),
    },
  };
};

const markets = [
  {
    data: {
      market: {
        id: 'c9f5acd348796011c075077e4d58d9b7f1689b7c1c8e030a5e886b83aa96923d',
        __typename: 'Market',
      },
      marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
      staticMidPrice: '0',
      indicativePrice: '0',
      bestStaticBidPrice: '0',
      bestStaticOfferPrice: '0',
      indicativeVolume: '0',
      bestBidPrice: '0',
      bestOfferPrice: '0',
      markPrice: '17588787',
      trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED,
      __typename: 'MarketData',
    },
    __typename: 'Market',
  },
  {
    data: {
      market: {
        id: '5a4b0b9e9c0629f0315ec56fcb7bd444b0c6e4da5ec7677719d502626658a376',
        __typename: 'Market',
      },
      marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
      staticMidPrice: '0',
      indicativePrice: '0',
      bestStaticBidPrice: '0',
      bestStaticOfferPrice: '0',
      indicativeVolume: '0',
      bestBidPrice: '0',
      bestOfferPrice: '0',
      markPrice: '84377569',
      trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED,
      __typename: 'MarketData',
    },
    __typename: 'Market',
  },
];
export const generateMarketsData = (
  override?: PartialDeep<MarketsDataQuery>
): MarketsDataQuery => {
  const defaultResult: MarketsDataQuery = {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: markets.map((node) => ({
        __typename: 'MarketEdge',
        node: node as {
          __typename: 'Market';
          data: MarketDataFieldsFragment;
        },
      })),
    },
  };

  return merge(defaultResult, override);
};

export const generatePositionsMarkets = () => {
  return {
    marketsConnection: {
      edges: [
        {
          node: {
            id: 'c9f5acd348796011c075077e4d58d9b7f1689b7c1c8e030a5e886b83aa96923d',
            decimalPlaces: 5,
            positionDecimalPlaces: 0,
            state: 'STATE_ACTIVE',
            tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
            fees: {
              factors: {
                makerFee: '0.0002',
                infrastructureFee: '0.0005',
                liquidityFee: '0.001',
                __typename: 'FeeFactors',
              },
              __typename: 'Fees',
            },
            tradableInstrument: {
              instrument: {
                id: '',
                name: 'UNIDAI Monthly (30 Jun 2022)',
                code: 'UNIDAI.MF21',
                metadata: {
                  tags: [
                    'formerly:5A86B190C384997F',
                    'quote:EURO',
                    'ticker:TSLA',
                    'class:equities/single-stock-futures',
                    'sector:tech',
                    'listing_venue:NASDAQ',
                    'country:US',
                  ],
                  __typename: 'InstrumentMetadata',
                },
                product: {
                  settlementAsset: {
                    __typename: 'Asset',
                    id: 'asset-tDAI',
                    symbol: 'tDAI',
                    decimals: 5,
                  },
                  quoteName: 'DAI',
                  __typename: 'Future',
                },
                __typename: 'Instrument',
              },
              __typename: 'TradableInstrument',
            },
            marketTimestamps: {
              open: '2022-09-28T14:03:19.937087458Z',
              close: null,
              __typename: 'MarketTimestamps',
            },
            __typename: 'Market',
          },
          __typename: 'MarketEdge',
        },
        {
          node: {
            id: '0604e8c918655474525e1a95367902266ade70d318c2c908f0cca6e3d11dcb13',
            decimalPlaces: 5,
            positionDecimalPlaces: 0,
            state: 'STATE_ACTIVE',
            tradingMode: 'TRADING_MODE_CONTINUOUS',
            fees: {
              factors: {
                makerFee: '0.0002',
                infrastructureFee: '0.0005',
                liquidityFee: '0.001',
                __typename: 'FeeFactors',
              },
              __typename: 'Fees',
            },
            tradableInstrument: {
              instrument: {
                id: '',
                name: 'AAVEDAI Monthly (30 Jun 2022)',
                code: 'AAVEDAI.MF21',
                metadata: {
                  tags: [
                    'formerly:2839D9B2329C9E70',
                    'base:AAVE',
                    'quote:DAI',
                    'class:fx/crypto',
                    'monthly',
                    'sector:defi',
                  ],
                  __typename: 'InstrumentMetadata',
                },
                product: {
                  settlementAsset: {
                    __typename: 'Asset',
                    id: 'asset-tDAI',
                    symbol: 'tDAI',
                    decimals: 5,
                  },
                  quoteName: 'DAI',
                  __typename: 'Future',
                },
                __typename: 'Instrument',
              },
              __typename: 'TradableInstrument',
            },
            marketTimestamps: {
              open: '2022-09-28T14:03:19.937087458Z',
              close: null,
              __typename: 'MarketTimestamps',
            },
            __typename: 'Market',
          },
          __typename: 'MarketEdge',
        },
        {
          node: {
            id: '5a4b0b9e9c0629f0315ec56fcb7bd444b0c6e4da5ec7677719d502626658a376',
            decimalPlaces: 5,
            positionDecimalPlaces: 0,
            state: 'STATE_ACTIVE',
            tradingMode: 'TRADING_MODE_CONTINUOUS',
            fees: {
              factors: {
                makerFee: '0.0002',
                infrastructureFee: '0.0005',
                liquidityFee: '0.001',
                __typename: 'FeeFactors',
              },
              __typename: 'Fees',
            },
            tradableInstrument: {
              instrument: {
                id: '',
                name: 'Tesla Quarterly (30 Jun 2022)',
                code: 'TSLA.QM21',
                metadata: {
                  tags: [
                    'formerly:4899E01009F1A721',
                    'quote:USD',
                    'ticker:AAPL',
                    'class:equities/single-stock-futures',
                    'sector:tech',
                    'listing_venue:NASDAQ',
                    'country:US',
                  ],
                  __typename: 'InstrumentMetadata',
                },
                product: {
                  settlementAsset: {
                    __typename: 'Asset',
                    id: 'asset-tEURO',
                    symbol: 'tEURO',
                    decimals: 5,
                  },
                  quoteName: 'EURO',
                  __typename: 'Future',
                },
                __typename: 'Instrument',
              },
              __typename: 'TradableInstrument',
            },
            marketTimestamps: {
              open: '2022-09-28T14:03:19.937087458Z',
              close: null,
              __typename: 'MarketTimestamps',
            },
            __typename: 'Market',
          },
          __typename: 'MarketEdge',
        },
      ],
      __typename: 'MarketConnection',
    },
  };
};

export const generateMarket = (
  override?: PartialDeep<MarketQuery>
): MarketQuery => {
  const defaultResult = {
    market: {
      ...singleMarket,
    },
  };
  return merge(defaultResult, override);
};

export const generateMarketData = (): MarketDataQuery => {
  return {
    marketsConnection: {
      edges: [
        {
          node: {
            data: {
              market: {
                id: protoMarket.id,
                __typename: 'Market',
              },
              marketTradingMode:
                Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
              marketState: Schema.MarketState.STATE_ACTIVE,
              staticMidPrice: '0',
              indicativePrice: '0',
              bestStaticBidPrice: '0',
              bestStaticOfferPrice: '0',
              indicativeVolume: '0',
              bestBidPrice: '0',
              bestOfferPrice: '0',
              markPrice: '17588787',
              trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED,
              __typename: 'MarketData',
            },
          },
        },
      ],
    },
  };
};
