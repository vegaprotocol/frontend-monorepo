import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type {
  Positions,
  Positions_party_positions,
} from '@vegaprotocol/positions';
import { MarketTradingMode } from '@vegaprotocol/types';

export const generatePositions = (
  override?: PartialDeep<Positions>
): Positions => {
  const positions: Positions_party_positions[] = [
    {
      realisedPNL: '0',
      openVolume: '6',
      unrealisedPNL: '895000',
      averageEntryPrice: '1129935',
      market: {
        id: 'c9f5acd348796011c075077e4d58d9b7f1689b7c1c8e030a5e886b83aa96923d',
        name: 'UNIDAI Monthly (30 Jun 2022)',
        data: {
          markPrice: '17588787',
          marketTradingMode: MarketTradingMode.Continuous,
          __typename: 'MarketData',
          market: { __typename: 'Market', id: '123' },
        },
        decimalPlaces: 5,
        tradableInstrument: {
          instrument: {
            id: '',
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
            code: 'UNIDAI.MF21',
            product: {
              settlementAsset: {
                id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
                symbol: 'tDAI',
                name: 'tDAI TEST',
                decimals: 5,
                __typename: 'Asset',
              },
              quoteName: 'DAI',
              __typename: 'Future',
            },
            __typename: 'Instrument',
          },
          __typename: 'TradableInstrument',
        },
        __typename: 'Market',
      },
      __typename: 'Position',
    },
    {
      realisedPNL: '0',
      openVolume: '1',
      unrealisedPNL: '-22519',
      averageEntryPrice: '84400088',
      market: {
        id: '5a4b0b9e9c0629f0315ec56fcb7bd444b0c6e4da5ec7677719d502626658a376',
        name: 'Tesla Quarterly (30 Jun 2022)',
        data: {
          markPrice: '84377569',
          marketTradingMode: MarketTradingMode.Continuous,
          __typename: 'MarketData',
          market: {
            __typename: 'Market',
            id: '5a4b0b9e9c0629f0315ec56fcb7bd444b0c6e4da5ec7677719d502626658a376',
          },
        },
        decimalPlaces: 5,
        tradableInstrument: {
          instrument: {
            id: '',
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
            code: 'TSLA.QM21',
            product: {
              settlementAsset: {
                id: '8b52d4a3a4b0ffe733cddbc2b67be273816cfeb6ca4c8b339bac03ffba08e4e4',
                symbol: 'tEURO',
                name: 'tEURO TEST',
                decimals: 5,
                __typename: 'Asset',
              },
              quoteName: 'EURO',
              __typename: 'Future',
            },
            __typename: 'Instrument',
          },
          __typename: 'TradableInstrument',
        },
        __typename: 'Market',
      },
      __typename: 'Position',
    },
  ];

  const defaultResult = {
    party: {
      id: Cypress.env('vegaPublicKey'),
      positions,
      __typename: 'Party',
    },
  };

  return merge(defaultResult, override);
};
