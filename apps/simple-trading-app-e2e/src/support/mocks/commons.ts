const protoCandles = [
  { open: '9556163', close: '9587028', __typename: 'Candle' },
  {
    open: '9587028',
    close: '9769899',
    __typename: 'Candle',
  },
  { open: '9769899', close: '9586292', __typename: 'Candle' },
  {
    open: '9586292',
    close: '9261774',
    __typename: 'Candle',
  },
  { open: '9261773', close: '9236369', __typename: 'Candle' },
  {
    open: '9236369',
    close: '9226070',
    __typename: 'Candle',
  },
  { open: '9226077', close: '9233252', __typename: 'Candle' },
  {
    open: '9249854',
    close: '9333038',
    __typename: 'Candle',
  },
  { open: '9333038', close: '9410371', __typename: 'Candle' },
  {
    open: '9410371',
    close: '9626249',
    __typename: 'Candle',
  },
  { open: '9626247', close: '9493253', __typename: 'Candle' },
  {
    open: '9493253',
    close: '9309054',
    __typename: 'Candle',
  },
  { open: '9309054', close: '9378428', __typename: 'Candle' },
  {
    open: '9378428',
    close: '9352996',
    __typename: 'Candle',
  },
  { open: '9352996', close: '9451142', __typename: 'Candle' },
  {
    open: '9451142',
    close: '9691070',
    __typename: 'Candle',
  },
  { open: '9691071', close: '9622031', __typename: 'Candle' },
  {
    open: '9622034',
    close: '9519285',
    __typename: 'Candle',
  },
  { open: '9528904', close: '9671275', __typename: 'Candle' },
  {
    open: '9671275',
    close: '9988454',
    __typename: 'Candle',
  },
  { open: '9982457', close: '10085537', __typename: 'Candle' },
  {
    open: '10085537',
    close: '9967390',
    __typename: 'Candle',
  },
  { open: '9967390', close: '9974844', __typename: 'Candle' },
  {
    open: '9974844',
    close: '9940706',
    __typename: 'Candle',
  },
];

export const protoMarket = {
  id: 'first-btcusd-id',
  name: 'AAVEDAI Monthly (30 Jun 2022)',
  state: 'Active',
  data: {
    market: {
      id: 'first-btcusd-id',
      state: 'Active',
      __typename: 'Market',
    },
    __typename: 'MarketData',
  },
  tradableInstrument: {
    instrument: {
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
        __typename: 'Future',
        quoteName: 'DAI',
        settlementAsset: { symbol: 'tDAI', __typename: 'Asset' },
      },
      __typename: 'Instrument',
    },
    __typename: 'TradableInstrument',
  },
  candles: protoCandles,
  __typename: 'Market',
};
