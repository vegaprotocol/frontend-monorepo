import type { MarketList } from '../components/__generated__/MarketList';
import { mapDataToMarketList } from './market-list.utils';

describe('mapDataToMarketList', () => {
  it('should map queried data to market list format', () => {
    expect(mapDataToMarketList(mockData as unknown as MarketList)).toEqual(
      mockMarketList.data
    );
  });
});

const mockMarketList = {
  data: [
    {
      id: 'a5de54820d2d35e3187075ead161db9986f5dee3fc40d03031ab52ef6f107fa3',
      marketName: 'TSLA.QM21',
      lastPrice: 727.9875,
      candles: [
        {
          open: 690.15964,
          close: 690.56629,
        },
        {
          open: 691.90522,
          close: 689.57764,
        },
        {
          open: 689.68986,
          close: 690.82376,
        },
        {
          open: 691.75837,
          close: 691.17757,
        },
        {
          open: 690.25053,
          close: 692.781,
        },
        {
          open: 691.24157,
          close: 694.9331,
        },
        {
          open: 695.42058,
          close: 695.36472,
        },
        {
          open: 696.01588,
          close: 695.75024,
        },
        {
          open: 695.38878,
          close: 700.32275,
        },
        {
          open: 700.56124,
          close: 710.97055,
        },
        {
          open: 710.81057,
          close: 715.1682,
        },
        {
          open: 714.36152,
          close: 715.82708,
        },
        {
          open: 717.17511,
          close: 714.83499,
        },
        {
          open: 715.54246,
          close: 706.79553,
        },
        {
          open: 708.09772,
          close: 707.22981,
        },
        {
          open: 710.98238,
          close: 715.16226,
        },
        {
          open: 711.51029,
          close: 696.09831,
        },
        {
          open: 703.95835,
          close: 716.84445,
        },
        {
          open: 717.17167,
          close: 717.17167,
        },
        {
          open: 709.94216,
          close: 709.94216,
        },
        {
          open: 720.66907,
          close: 720.66907,
        },
        {
          open: 723.35739,
          close: 720.74048,
        },
        {
          open: 725.58667,
          close: 730.44155,
        },
        {
          open: 727.9875,
          close: 727.9875,
        },
      ],
      change: 5.418916408445017,
      open: new Date('2022-05-04T14:38:25.627Z'),
      close: null,
    },
    {
      id: '0e4c4e0ce6626ea5c6bf5b5b510afadb3c91627aa9ff61e4c7e37ef8394f2c6f',
      marketName: 'AAPL.MF21',
      lastPrice: 148.84155,
      candles: [
        {
          open: 145.38619,
          close: 145.54637,
        },
        {
          open: 145.7078,
          close: 145.49777,
        },
        {
          open: 145.534,
          close: 146.18154,
        },
        {
          open: 146.07611,
          close: 145.87056,
        },
        {
          open: 146.07975,
          close: 146.17008,
        },
        {
          open: 146.14329,
          close: 146.19114,
        },
        {
          open: 146.19114,
          close: 146.23892,
        },
        {
          open: 146.34979,
          close: 146.32875,
        },
        {
          open: 146.32881,
          close: 146.77727,
        },
        {
          open: 146.77727,
          close: 147.52124,
        },
        {
          open: 147.39103,
          close: 147.72955,
        },
        {
          open: 147.93641,
          close: 148.66936,
        },
        {
          open: 148.7673,
          close: 148.42856,
        },
        {
          open: 148.42856,
          close: 148.23555,
        },
        {
          open: 148.23645,
          close: 148.19855,
        },
        {
          open: 148.28126,
          close: 147.83115,
        },
        {
          open: 147.83115,
          close: 147.18056,
        },
        {
          open: 148.74435,
          close: 148.84155,
        },
      ],
      change: 2.264006996533132,
      open: new Date('2022-05-04T14:37:36.315Z'),
      close: null,
    },
    {
      id: '1de5530768d957929da52ed65f7c6e84cb8be58ac9e1137d50b9890c21803b46',
      marketName: 'UNIDAI.MF21',
      lastPrice: 5.33917,
      candles: [
        {
          open: 5.12304,
          close: 5.12304,
        },
        {
          open: 5.33917,
          close: 5.33917,
        },
      ],
      change: 4.218784159405353,
      open: new Date('2022-05-04T14:36:37.572Z'),
      close: null,
    },
    {
      id: 'e4c0d439b8f6952096454e8262e20fb47adfaa7eb031d4b661ac99b2d063a932',
      marketName: 'AAVEDAI.MF21',
      lastPrice: 89.41046,
      candles: [
        {
          open: 86.3297,
          close: 85.10182,
        },
        {
          open: 85.10182,
          close: 83.84452,
        },
        {
          open: 83.93169,
          close: 87.22837,
        },
        {
          open: 87.24629,
          close: 88.002,
        },
        {
          open: 88.19158,
          close: 88.26956,
        },
        {
          open: 88.02959,
          close: 89.86122,
        },
        {
          open: 89.66207,
          close: 90.64289,
        },
        {
          open: 90.92497,
          close: 90.87582,
        },
        {
          open: 90.14315,
          close: 91.1984,
        },
        {
          open: 91.04808,
          close: 89.26628,
        },
        {
          open: 89.26632,
          close: 89.51526,
        },
        {
          open: 89.33669,
          close: 89.65633,
        },
        {
          open: 89.73185,
          close: 89.52589,
        },
        {
          open: 89.40648,
          close: 88.6083,
        },
        {
          open: 89.70664,
          close: 91.75331,
        },
        {
          open: 91.69936,
          close: 91.8488,
        },
        {
          open: 91.81364,
          close: 89.21622,
        },
        {
          open: 88.65962,
          close: 88.65962,
        },
        {
          open: 89.28267,
          close: 89.41046,
        },
      ],
      change: 5.062923448640698,
      open: new Date('2022-05-04T14:36:33.858Z'),
      close: null,
    },
    {
      id: '868b8865bae80bd663d6c6c78fb26b40b7047ee8daaf68d539e8f587faed4934',
      marketName: 'ETHBTC.QM21',
      lastPrice: 0.0679,
      candles: [
        {
          open: 0.06747,
          close: 0.06734,
        },
        {
          open: 0.06698,
          close: 0.06712,
        },
        {
          open: 0.06711,
          close: 0.06771,
        },
        {
          open: 0.06771,
          close: 0.06733,
        },
        {
          open: 0.06696,
          close: 0.06736,
        },
        {
          open: 0.06733,
          close: 0.06775,
        },
        {
          open: 0.0677,
          close: 0.0677,
        },
        {
          open: 0.06802,
          close: 0.06747,
        },
        {
          open: 0.06747,
          close: 0.06773,
        },
        {
          open: 0.06773,
          close: 0.06709,
        },
        {
          open: 0.06709,
          close: 0.06798,
        },
        {
          open: 0.06851,
          close: 0.06748,
        },
        {
          open: 0.06748,
          close: 0.06788,
        },
        {
          open: 0.06786,
          close: 0.06823,
        },
        {
          open: 0.06815,
          close: 0.06818,
        },
        {
          open: 0.06818,
          close: 0.0684,
        },
        {
          open: 0.06851,
          close: 0.06822,
        },
        {
          open: 0.0688,
          close: 0.06799,
        },
        {
          open: 0.06796,
          close: 0.06794,
        },
        {
          open: 0.06806,
          close: 0.0678,
        },
        {
          open: 0.06802,
          close: 0.06784,
        },
        {
          open: 0.06882,
          close: 0.06745,
        },
        {
          open: 0.0681,
          close: 0.06781,
        },
        {
          open: 0.06816,
          close: 0.0676,
        },
        {
          open: 0.0676,
          close: 0.0679,
        },
      ],
      change: 0.8316008316008316,
      open: new Date('2022-05-04T14:34:10.658Z'),
      close: null,
    },
    {
      id: '7d5e9b999bde50aca40a81c2716781b5a073a9ed72022e4933f6ca874cf8cd2b',
      marketName: 'APEUSD',
      lastPrice: 'N/A',
      change: 0,
      open: new Date('2022-05-04T14:33:28.023Z'),
      close: null,
    },
    {
      id: '0148460d4f98f9feae9aad8f2cab0b2fbef14177a8c8b1bb101dbc854ff1791c',
      marketName: 'BTCUSD.MF21',
      lastPrice: 'N/A',
      change: 0,
      open: new Date('2022-05-04T13:49:11.227Z'),
      close: null,
    },
    {
      id: '688b54235308c20412f62adad13ffc169b2372126b6e6d0bb34c6f9597b5ccad',
      marketName: 'BTCUSD.MF21',
      lastPrice: 'N/A',
      change: 0,
      open: new Date('2022-05-04T13:48:17.939Z'),
      close: null,
    },
    {
      id: 'fc5e4053f3fbf73933635dac3d14312eba6007048fe306b094c8524485f2a125',
      marketName: 'BTCUSD.MF21',
      lastPrice: 'N/A',
      change: 0,
      open: new Date('2022-05-04T13:33:45.832Z'),
      close: null,
    },
    {
      id: '9ef77dc3621c734575ee91f849fa16eb5ebd3529a35ee3d7cb2c5fc6f0b3ed20',
      marketName: 'BTCUSD.MF21',
      lastPrice: 'N/A',
      change: 0,
      open: new Date('2022-05-04T13:21:06.934Z'),
      close: null,
    },
    {
      id: '73fd274fc1db7e9e49b77cb331d745ab3b28988ecb0599ef76149ee344093e07',
      marketName: 'BTCUSD.MF21',
      lastPrice: 'N/A',
      change: 0,
      open: new Date('2022-05-04T13:07:11.583Z'),
      close: null,
    },
    {
      id: 'd74bb976aaa99851275388bbaffda680ca9ef16309dce627002e6586b526675e',
      marketName: 'BTCUSD.MF21',
      lastPrice: 'N/A',
      change: 0,
      open: new Date('2022-05-04T13:02:09.511Z'),
      close: null,
    },
  ],
};

const mockData = {
  markets: [
    {
      __typename: 'Market',
      id: '0148460d4f98f9feae9aad8f2cab0b2fbef14177a8c8b1bb101dbc854ff1791c',
      decimalPlaces: 5,
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          name: 'BTCUSD Monthly (30 Jun 2022)',
          code: 'BTCUSD.MF21',
        },
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: new Date('2022-05-04T13:49:11.227283334Z'),
        close: null,
      },
      candles: null,
    },
    {
      __typename: 'Market',
      id: '0e4c4e0ce6626ea5c6bf5b5b510afadb3c91627aa9ff61e4c7e37ef8394f2c6f',
      decimalPlaces: 5,
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          name: 'Apple Monthly (30 Jun 2022)',
          code: 'AAPL.MF21',
        },
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: new Date('2022-05-04T14:37:36.315572331Z'),
        close: null,
      },
      candles: [
        {
          __typename: 'Candle',
          open: '14538619',
          close: '14554637',
        },
        {
          __typename: 'Candle',
          open: '14570780',
          close: '14549777',
        },
        {
          __typename: 'Candle',
          open: '14553400',
          close: '14618154',
        },
        {
          __typename: 'Candle',
          open: '14607611',
          close: '14587056',
        },
        {
          __typename: 'Candle',
          open: '14607975',
          close: '14617008',
        },
        {
          __typename: 'Candle',
          open: '14614329',
          close: '14619114',
        },
        {
          __typename: 'Candle',
          open: '14619114',
          close: '14623892',
        },
        {
          __typename: 'Candle',
          open: '14634979',
          close: '14632875',
        },
        {
          __typename: 'Candle',
          open: '14632881',
          close: '14677727',
        },
        {
          __typename: 'Candle',
          open: '14677727',
          close: '14752124',
        },
        {
          __typename: 'Candle',
          open: '14739103',
          close: '14772955',
        },
        {
          __typename: 'Candle',
          open: '14793641',
          close: '14866936',
        },
        {
          __typename: 'Candle',
          open: '14876730',
          close: '14842856',
        },
        {
          __typename: 'Candle',
          open: '14842856',
          close: '14823555',
        },
        {
          __typename: 'Candle',
          open: '14823645',
          close: '14819855',
        },
        {
          __typename: 'Candle',
          open: '14828126',
          close: '14783115',
        },
        {
          __typename: 'Candle',
          open: '14783115',
          close: '14718056',
        },
        {
          __typename: 'Candle',
          open: '14874435',
          close: '14884155',
        },
      ],
    },
    {
      __typename: 'Market',
      id: '1de5530768d957929da52ed65f7c6e84cb8be58ac9e1137d50b9890c21803b46',
      decimalPlaces: 5,
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          name: 'UNIDAI Monthly (30 Jun 2022)',
          code: 'UNIDAI.MF21',
        },
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: new Date('2022-05-04T14:36:37.572903145Z'),
        close: null,
      },
      candles: [
        {
          __typename: 'Candle',
          open: '512304',
          close: '512304',
        },
        {
          __typename: 'Candle',
          open: '533917',
          close: '533917',
        },
      ],
    },
    {
      __typename: 'Market',
      id: '688b54235308c20412f62adad13ffc169b2372126b6e6d0bb34c6f9597b5ccad',
      decimalPlaces: 5,
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          name: 'BTCUSD Monthly (30 Jun 2022)',
          code: 'BTCUSD.MF21',
        },
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: new Date('2022-05-04T13:48:17.939571184Z'),
        close: null,
      },
      candles: null,
    },
    {
      __typename: 'Market',
      id: '73fd274fc1db7e9e49b77cb331d745ab3b28988ecb0599ef76149ee344093e07',
      decimalPlaces: 5,
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          name: 'BTCUSD Monthly (30 Jun 2022)',
          code: 'BTCUSD.MF21',
        },
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: new Date('2022-05-04T13:07:11.583685415Z'),
        close: null,
      },
      candles: null,
    },
    {
      __typename: 'Market',
      id: '7d5e9b999bde50aca40a81c2716781b5a073a9ed72022e4933f6ca874cf8cd2b',
      decimalPlaces: 2,
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          name: 'APEUSD (May 2022)',
          code: 'APEUSD',
        },
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: new Date('2022-05-04T14:33:28.023495506Z'),
        close: null,
      },
      candles: null,
    },
    {
      __typename: 'Market',
      id: '868b8865bae80bd663d6c6c78fb26b40b7047ee8daaf68d539e8f587faed4934',
      decimalPlaces: 5,
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          name: 'ETHBTC Quarterly (30 Jun 2022)',
          code: 'ETHBTC.QM21',
        },
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: new Date('2022-05-04T14:34:10.658219903Z'),
        close: null,
      },
      candles: [
        {
          __typename: 'Candle',
          open: '6747',
          close: '6734',
        },
        {
          __typename: 'Candle',
          open: '6698',
          close: '6712',
        },
        {
          __typename: 'Candle',
          open: '6711',
          close: '6771',
        },
        {
          __typename: 'Candle',
          open: '6771',
          close: '6733',
        },
        {
          __typename: 'Candle',
          open: '6696',
          close: '6736',
        },
        {
          __typename: 'Candle',
          open: '6733',
          close: '6775',
        },
        {
          __typename: 'Candle',
          open: '6770',
          close: '6770',
        },
        {
          __typename: 'Candle',
          open: '6802',
          close: '6747',
        },
        {
          __typename: 'Candle',
          open: '6747',
          close: '6773',
        },
        {
          __typename: 'Candle',
          open: '6773',
          close: '6709',
        },
        {
          __typename: 'Candle',
          open: '6709',
          close: '6798',
        },
        {
          __typename: 'Candle',
          open: '6851',
          close: '6748',
        },
        {
          __typename: 'Candle',
          open: '6748',
          close: '6788',
        },
        {
          __typename: 'Candle',
          open: '6786',
          close: '6823',
        },
        {
          __typename: 'Candle',
          open: '6815',
          close: '6818',
        },
        {
          __typename: 'Candle',
          open: '6818',
          close: '6840',
        },
        {
          __typename: 'Candle',
          open: '6851',
          close: '6822',
        },
        {
          __typename: 'Candle',
          open: '6880',
          close: '6799',
        },
        {
          __typename: 'Candle',
          open: '6796',
          close: '6794',
        },
        {
          __typename: 'Candle',
          open: '6806',
          close: '6780',
        },
        {
          __typename: 'Candle',
          open: '6802',
          close: '6784',
        },
        {
          __typename: 'Candle',
          open: '6882',
          close: '6745',
        },
        {
          __typename: 'Candle',
          open: '6810',
          close: '6781',
        },
        {
          __typename: 'Candle',
          open: '6816',
          close: '6760',
        },
        {
          __typename: 'Candle',
          open: '6760',
          close: '6790',
        },
      ],
    },
    {
      __typename: 'Market',
      id: '9ef77dc3621c734575ee91f849fa16eb5ebd3529a35ee3d7cb2c5fc6f0b3ed20',
      decimalPlaces: 5,
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          name: 'BTCUSD Monthly (30 Jun 2022)',
          code: 'BTCUSD.MF21',
        },
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: new Date('2022-05-04T13:21:06.934149131Z'),
        close: null,
      },
      candles: null,
    },
    {
      __typename: 'Market',
      id: 'a5de54820d2d35e3187075ead161db9986f5dee3fc40d03031ab52ef6f107fa3',
      decimalPlaces: 5,
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          name: 'Tesla Quarterly (30 Jun 2022)',
          code: 'TSLA.QM21',
        },
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: new Date('2022-05-04T14:38:25.627881801Z'),
        close: null,
      },
      candles: [
        {
          __typename: 'Candle',
          open: '69015964',
          close: '69056629',
        },
        {
          __typename: 'Candle',
          open: '69190522',
          close: '68957764',
        },
        {
          __typename: 'Candle',
          open: '68968986',
          close: '69082376',
        },
        {
          __typename: 'Candle',
          open: '69175837',
          close: '69117757',
        },
        {
          __typename: 'Candle',
          open: '69025053',
          close: '69278100',
        },
        {
          __typename: 'Candle',
          open: '69124157',
          close: '69493310',
        },
        {
          __typename: 'Candle',
          open: '69542058',
          close: '69536472',
        },
        {
          __typename: 'Candle',
          open: '69601588',
          close: '69575024',
        },
        {
          __typename: 'Candle',
          open: '69538878',
          close: '70032275',
        },
        {
          __typename: 'Candle',
          open: '70056124',
          close: '71097055',
        },
        {
          __typename: 'Candle',
          open: '71081057',
          close: '71516820',
        },
        {
          __typename: 'Candle',
          open: '71436152',
          close: '71582708',
        },
        {
          __typename: 'Candle',
          open: '71717511',
          close: '71483499',
        },
        {
          __typename: 'Candle',
          open: '71554246',
          close: '70679553',
        },
        {
          __typename: 'Candle',
          open: '70809772',
          close: '70722981',
        },
        {
          __typename: 'Candle',
          open: '71098238',
          close: '71516226',
        },
        {
          __typename: 'Candle',
          open: '71151029',
          close: '69609831',
        },
        {
          __typename: 'Candle',
          open: '70395835',
          close: '71684445',
        },
        {
          __typename: 'Candle',
          open: '71717167',
          close: '71717167',
        },
        {
          __typename: 'Candle',
          open: '70994216',
          close: '70994216',
        },
        {
          __typename: 'Candle',
          open: '72066907',
          close: '72066907',
        },
        {
          __typename: 'Candle',
          open: '72335739',
          close: '72074048',
        },
        {
          __typename: 'Candle',
          open: '72558667',
          close: '73044155',
        },
        {
          __typename: 'Candle',
          open: '72798750',
          close: '72798750',
        },
      ],
    },
    {
      __typename: 'Market',
      id: 'd74bb976aaa99851275388bbaffda680ca9ef16309dce627002e6586b526675e',
      decimalPlaces: 5,
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          name: 'BTCUSD Monthly (30 Jun 2022)',
          code: 'BTCUSD.MF21',
        },
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: new Date('2022-05-04T13:02:09.511671086Z'),
        close: null,
      },
      candles: null,
    },
    {
      __typename: 'Market',
      id: 'e4c0d439b8f6952096454e8262e20fb47adfaa7eb031d4b661ac99b2d063a932',
      decimalPlaces: 5,
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          name: 'AAVEDAI Monthly (30 Jun 2022)',
          code: 'AAVEDAI.MF21',
        },
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: new Date('2022-05-04T14:36:33.858842007Z'),
        close: null,
      },
      candles: [
        {
          __typename: 'Candle',
          open: '8632970',
          close: '8510182',
        },
        {
          __typename: 'Candle',
          open: '8510182',
          close: '8384452',
        },
        {
          __typename: 'Candle',
          open: '8393169',
          close: '8722837',
        },
        {
          __typename: 'Candle',
          open: '8724629',
          close: '8800200',
        },
        {
          __typename: 'Candle',
          open: '8819158',
          close: '8826956',
        },
        {
          __typename: 'Candle',
          open: '8802959',
          close: '8986122',
        },
        {
          __typename: 'Candle',
          open: '8966207',
          close: '9064289',
        },
        {
          __typename: 'Candle',
          open: '9092497',
          close: '9087582',
        },
        {
          __typename: 'Candle',
          open: '9014315',
          close: '9119840',
        },
        {
          __typename: 'Candle',
          open: '9104808',
          close: '8926628',
        },
        {
          __typename: 'Candle',
          open: '8926632',
          close: '8951526',
        },
        {
          __typename: 'Candle',
          open: '8933669',
          close: '8965633',
        },
        {
          __typename: 'Candle',
          open: '8973185',
          close: '8952589',
        },
        {
          __typename: 'Candle',
          open: '8940648',
          close: '8860830',
        },
        {
          __typename: 'Candle',
          open: '8970664',
          close: '9175331',
        },
        {
          __typename: 'Candle',
          open: '9169936',
          close: '9184880',
        },
        {
          __typename: 'Candle',
          open: '9181364',
          close: '8921622',
        },
        {
          __typename: 'Candle',
          open: '8865962',
          close: '8865962',
        },
        {
          __typename: 'Candle',
          open: '8928267',
          close: '8941046',
        },
      ],
    },
    {
      __typename: 'Market',
      id: 'fc5e4053f3fbf73933635dac3d14312eba6007048fe306b094c8524485f2a125',
      decimalPlaces: 5,
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          name: 'BTCUSD Monthly (30 Jun 2022)',
          code: 'BTCUSD.MF21',
        },
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: new Date('2022-05-04T13:33:45.832759092Z'),
        close: null,
      },
      candles: null,
    },
  ],
};
