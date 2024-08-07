/* eslint-disable @typescript-eslint/no-explicit-any */
import { RpcMethods } from '@/lib/client-rpc-methods';
import { generateMarket } from '@/test-helpers/generate-market';

import { testingNetwork } from '../../config/well-known-networks';
import { useMarketsStore } from './markets-store';

const MARKET_FIXTURE = generateMarket();

const marketsMock = {
  markets: {
    edges: [
      {
        node: MARKET_FIXTURE,
        cursor:
          'eyJ2ZWdhVGltZSI6IjIwMjMtMDktMThUMDY6MzI6MTIuODM1MDY2WiIsImlkIjoiM2FiNGZjMGVhN2U2ZWFiZTc0MTMzZmIxNGVmMmQ4OTM0ZmYyMWRkODk0ZmYwODBhMDllYzlhMzY0N2NlYjJhNCJ9',
      },
    ],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor:
        'eyJ2ZWdhVGltZSI6IjIwMjMtMDktMThUMDY6MzI6MTIuODM1MDY2WiIsImlkIjoiM2FiNGZjMGVhN2U2ZWFiZTc0MTMzZmIxNGVmMmQ4OTM0ZmYyMWRkODk0ZmYwODBhMDllYzlhMzY0N2NlYjJhNCJ9',
      endCursor:
        'eyJ2ZWdhVGltZSI6IjIwMjMtMDUtMDVUMTg6MDU6NTIuNjIwMjAzWiIsImlkIjoiODgxYzUyMGVjNDdkZDFjYjQ5MjE3YmM1NjljMmY0YzhjMGVjZjEwYzgzOTIxNDFlNmVhYjc4YmNjYjRjN2M3YiJ9',
    },
  },
};

const request = async (method: string, options?: any) => {
  if (method === RpcMethods.Fetch && options.path === 'api/v2/markets') {
    return marketsMock;
  }
  throw new Error('Failed to fetch markets');
};

const initialState = useMarketsStore.getState();

describe('MarketsStore', () => {
  beforeEach(() => {
    useMarketsStore.setState(initialState);
  });

  it('loads markets', async () => {
    expect(useMarketsStore.getState().loading).toBe(true);
    expect(useMarketsStore.getState().markets).toStrictEqual([]);
    expect(useMarketsStore.getState().error).toBeNull();
    await useMarketsStore
      .getState()
      .fetchMarkets(request as unknown as any, testingNetwork.id);
    expect(useMarketsStore.getState().loading).toBe(false);
    expect(useMarketsStore.getState().markets).toHaveLength(1);
    expect(useMarketsStore.getState().error).toBeNull();
  });

  it('sets loading and error states while fetching', async () => {
    useMarketsStore.setState({ loading: false, error: new Error('1') });
    const promise = useMarketsStore
      .getState()
      .fetchMarkets(request as unknown as any, testingNetwork.id);
    expect(useMarketsStore.getState().loading).toBe(true);
    expect(useMarketsStore.getState().error).toBeNull();
    await promise;
    expect(useMarketsStore.getState().loading).toBe(false);
  });

  it('allows you to fetch a market by id', async () => {
    useMarketsStore.setState({ markets: [MARKET_FIXTURE] });
    await useMarketsStore
      .getState()
      .fetchMarkets(request as unknown as any, testingNetwork.id);
    const market = useMarketsStore
      .getState()
      .getMarketById(MARKET_FIXTURE.id as string);
    expect(market).toStrictEqual(marketsMock.markets.edges[0].node);
  });

  it('throws error if the market is not found', async () => {
    useMarketsStore.setState({ markets: [] });
    expect(() => useMarketsStore.getState().getMarketById('nope')).toThrow(
      'Market with id nope not found'
    );
  });

  it('allows you to get markets by asset id', async () => {
    useMarketsStore.setState({
      markets: [
        {
          id: '1',
          tradableInstrument: {
            instrument: { future: { settlementAsset: 'foo' } },
          },
        },
        {
          id: '2',
          tradableInstrument: {
            instrument: { future: { settlementAsset: 'foo' } },
          },
        },
        {
          id: '3',
          tradableInstrument: {
            instrument: { future: { settlementAsset: 'bar' } },
          },
        },
        {
          id: '4',
          tradableInstrument: {
            instrument: { perpetual: { settlementAsset: 'baz' } },
          },
        },
      ],
    });
    expect(useMarketsStore.getState().getMarketsByAssetId('foo')).toHaveLength(
      2
    );
    expect(useMarketsStore.getState().getMarketsByAssetId('bar')).toHaveLength(
      1
    );
    expect(useMarketsStore.getState().getMarketsByAssetId('baz')).toHaveLength(
      1
    );
  });

  it('throws error if it could not find the settlement asset of a market', async () => {
    useMarketsStore.setState({
      markets: [
        {
          id: '1',
          tradableInstrument: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            instrument: { someOtherProductType: { settlementAsset: 'foo' } },
          },
        },
      ],
    });
    expect(() => useMarketsStore.getState().getMarketsByAssetId('foo')).toThrow(
      'Could not find settlement asset from market 1'
    );
  });
  it('sets error if error is thrown in request', async () => {
    const error = new Error('1');
    await useMarketsStore.getState().fetchMarkets(() => {
      throw error;
    }, testingNetwork.id);
    expect(useMarketsStore.getState().error).toBe(error);
  });
});
