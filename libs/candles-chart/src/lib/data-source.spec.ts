import { VegaDataSource } from './data-source';
import type { ApolloClient } from '@apollo/client';
import { Interval } from 'pennant';
import type {
  CandleFieldsFragment,
  CandlesQuery,
} from './__generated__/Candles';
import * as Schema from '@vegaprotocol/types';

const returnDataMocks = (nodes: CandleFieldsFragment[]): CandlesQuery => {
  return {
    data: {
      market: {
        decimalPlaces: 1,
        positionDecimalPlaces: 1,
        candlesConnection: {
          edges: nodes.map((node) => ({ node })),
        },
      },
    },
  } as CandlesQuery;
};

const dataMocks: {
  [key in Schema.Interval]?: Partial<CandleFieldsFragment>[];
} = {
  [Schema.Interval.INTERVAL_I1M]: [
    {
      __typename: 'Candle',
      periodStart: '2023-05-10T12:00:00Z',
      lastUpdateInPeriod: '',
      close: '10',
      volume: '1',
    },
    {
      __typename: 'Candle',
      periodStart: '2023-05-10T12:05:00Z',
      lastUpdateInPeriod: '',
      close: '5',
      volume: '2',
    },
  ],
  [Schema.Interval.INTERVAL_I5M]: [
    {
      __typename: 'Candle',
      periodStart: '2023-05-10T12:00:00Z',
      lastUpdateInPeriod: '',
      close: '10',
      volume: '1',
    },
    {
      __typename: 'Candle',
      periodStart: '2023-05-10T12:25:00Z',
      lastUpdateInPeriod: '',
      close: '5',
      volume: '2',
    },
  ],
  [Schema.Interval.INTERVAL_I15M]: [
    {
      __typename: 'Candle',
      periodStart: '2023-05-10T12:00:00Z',
      lastUpdateInPeriod: '',
      close: '10',
      volume: '1',
    },
    {
      __typename: 'Candle',
      periodStart: '2023-05-10T13:15:00Z',
      lastUpdateInPeriod: '',
      close: '5',
      volume: '2',
    },
  ],
  [Schema.Interval.INTERVAL_I1H]: [
    {
      __typename: 'Candle',
      periodStart: '2023-05-10T12:00:00Z',
      lastUpdateInPeriod: '',
      close: '10',
      volume: '1',
    },
    {
      __typename: 'Candle',
      periodStart: '2023-05-10T17:00:00Z',
      lastUpdateInPeriod: '',
      close: '5',
      volume: '2',
    },
  ],
  [Schema.Interval.INTERVAL_I6H]: [
    {
      __typename: 'Candle',
      periodStart: '2023-05-10T12:00:00Z',
      lastUpdateInPeriod: '',
      close: '10',
      volume: '1',
    },
    {
      __typename: 'Candle',
      periodStart: '2023-05-11T18:00:00Z',
      lastUpdateInPeriod: '',
      close: '5',
      volume: '2',
    },
  ],
  [Schema.Interval.INTERVAL_I1D]: [
    {
      __typename: 'Candle',
      periodStart: '2023-05-10T00:00:00Z',
      lastUpdateInPeriod: '',
      close: '10',
      volume: '1',
    },
    {
      __typename: 'Candle',
      periodStart: '2023-05-15T00:00:00Z',
      lastUpdateInPeriod: '',
      close: '5',
      volume: '2',
    },
  ],
  [Schema.Interval.INTERVAL_BLOCK]: [],
};

describe('VegaDataSource', () => {
  const marketId = 'marketId';
  const partyId = 'partyId';
  const client = {
    query: jest.fn().mockImplementation(({ variables: { interval } }) => {
      return returnDataMocks(
        dataMocks[interval as Schema.Interval] as CandleFieldsFragment[]
      );
    }),
  } as unknown as ApolloClient<object>;

  it('should be properly initialized', () => {
    const dataSource = new VegaDataSource(client, marketId, partyId);
    expect(dataSource).toBeInstanceOf(VegaDataSource);
    expect(dataSource.onReady).toBeDefined();
    expect(dataSource.query).toBeDefined();
    expect(dataSource.subscribeData).toBeDefined();
    expect(dataSource.unsubscribeData).toBeDefined();
    expect(dataSource.decimalPlaces).toBeDefined();
    expect(dataSource.positionDecimalPlaces).toBeDefined();
  });

  describe('query should return continuous data', () => {
    it('when interval is I1M', async () => {
      const dataSource = new VegaDataSource(client, marketId, partyId);
      const data = await dataSource.query(Interval.I1M, '');
      expect(data).toHaveLength(6);
      expect(data[1]).toStrictEqual({
        date: new Date('2023-05-10T12:01:00Z'),
        high: 1,
        low: 1,
        open: 1,
        close: 1,
        volume: 0,
      });
      expect(data[2]).toStrictEqual({
        date: new Date('2023-05-10T12:02:00Z'),
        high: 1,
        low: 1,
        open: 1,
        close: 1,
        volume: 0,
      });
    });

    it('when interval is I5M', async () => {
      const dataSource = new VegaDataSource(client, marketId, partyId);
      const data = await dataSource.query(Interval.I5M, '');
      expect(data).toHaveLength(6);
      expect(data[1]).toStrictEqual({
        date: new Date('2023-05-10T12:05:00Z'),
        high: 1,
        low: 1,
        open: 1,
        close: 1,
        volume: 0,
      });
      expect(data[2]).toStrictEqual({
        date: new Date('2023-05-10T12:10:00Z'),
        high: 1,
        low: 1,
        open: 1,
        close: 1,
        volume: 0,
      });
    });

    it('when interval is I15M', async () => {
      const dataSource = new VegaDataSource(client, marketId, partyId);
      const data = await dataSource.query(Interval.I15M, '');
      expect(data).toHaveLength(6);
      expect(data[1]).toStrictEqual({
        date: new Date('2023-05-10T12:15:00Z'),
        high: 1,
        low: 1,
        open: 1,
        close: 1,
        volume: 0,
      });
      expect(data[2]).toStrictEqual({
        date: new Date('2023-05-10T12:30:00Z'),
        high: 1,
        low: 1,
        open: 1,
        close: 1,
        volume: 0,
      });
    });

    it('when interval is I1H', async () => {
      const dataSource = new VegaDataSource(client, marketId, partyId);
      const data = await dataSource.query(Interval.I1H, '');
      expect(data).toHaveLength(6);
      expect(data[1]).toStrictEqual({
        date: new Date('2023-05-10T13:00:00Z'),
        high: 1,
        low: 1,
        open: 1,
        close: 1,
        volume: 0,
      });
      expect(data[2]).toStrictEqual({
        date: new Date('2023-05-10T14:00:00Z'),
        high: 1,
        low: 1,
        open: 1,
        close: 1,
        volume: 0,
      });
    });

    it('when interval is I6H', async () => {
      const dataSource = new VegaDataSource(client, marketId, partyId);
      const data = await dataSource.query(Interval.I6H, '');
      expect(data).toHaveLength(6);
      expect(data[1]).toStrictEqual({
        date: new Date('2023-05-10T18:00:00Z'),
        high: 1,
        low: 1,
        open: 1,
        close: 1,
        volume: 0,
      });
      expect(data[2]).toStrictEqual({
        date: new Date('2023-05-11T00:00:00Z'),
        high: 1,
        low: 1,
        open: 1,
        close: 1,
        volume: 0,
      });
    });

    it('when interval is I1D', async () => {
      const dataSource = new VegaDataSource(client, marketId, partyId);
      const data = await dataSource.query(Interval.I1D, '');
      expect(data).toHaveLength(6);
      expect(data[1]).toStrictEqual({
        date: new Date('2023-05-11T00:00:00Z'),
        high: 1,
        low: 1,
        open: 1,
        close: 1,
        volume: 0,
      });
      expect(data[2]).toStrictEqual({
        date: new Date('2023-05-12T00:00:00Z'),
        high: 1,
        low: 1,
        open: 1,
        close: 1,
        volume: 0,
      });
    });
  });
});
