import {
  getDefaultOrder,
  STORAGE_KEY,
  useOrder,
  useOrderStore,
} from './use-order-store';
import { act, cleanup, renderHook } from '@testing-library/react';
import { OrderType } from '@vegaprotocol/types';

describe('useOrderStore', () => {
  const setup = () => {
    return renderHook(() => useOrderStore());
  };

  afterEach(() => {
    useOrderStore.setState({ orders: {} });
    localStorage.clear();
  });

  it('has a empty default state', () => {
    const { result } = setup();
    expect(result.current).toEqual({
      orders: {},
      update: expect.any(Function),
    });

    // https://github.com/pmndrs/zustand/issues/363
    cleanup();
  });

  it('can update', () => {
    const marketId = 'persisted-market-id';
    const expectedOrder = {
      ...getDefaultOrder(marketId),
      type: OrderType.TYPE_LIMIT,
      persist: true,
    };
    const { result } = setup();
    act(() => {
      result.current.update(marketId, { type: OrderType.TYPE_LIMIT });
    });
    // order should be stored in memory
    expect(result.current.orders).toEqual({
      [marketId]: expectedOrder,
    });
    // order SHOULD also be in localStorage
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '')).toEqual({
      state: {
        orders: {
          [marketId]: expectedOrder,
        },
      },
      version: 0,
    });

    // https://github.com/pmndrs/zustand/issues/363
    cleanup();
  });

  it('can update without persisting', () => {
    const marketId = 'non-persisted-market-id';
    const expectedOrder = {
      ...getDefaultOrder(marketId),
      type: OrderType.TYPE_LIMIT,
      persist: false,
    };
    const { result } = setup();
    act(() => {
      result.current.update(marketId, { type: OrderType.TYPE_LIMIT }, false);
    });
    // order should be stored in memory
    expect(result.current.orders).toEqual({
      [marketId]: expectedOrder,
    });
    // order should NOT be in localStorage
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '')).toEqual({
      state: {
        orders: {},
      },
      version: 0,
    });

    // https://github.com/pmndrs/zustand/issues/363
    cleanup();
  });
});

describe('useOrder', () => {
  const setup = (marketId: string) => {
    return renderHook(() => useOrder(marketId));
  };

  afterEach(() => {
    useOrderStore.setState({ orders: {} });
    localStorage.clear();
  });

  it('creates a new order if it doesnt exist', () => {
    const marketId = 'market-id';
    const expectedOrder = {
      ...getDefaultOrder(marketId),
      persist: false,
    };
    const { result } = setup(marketId);
    expect(result.current).toEqual([expectedOrder, expect.any(Function)]);

    // https://github.com/pmndrs/zustand/issues/363
    cleanup();
  });
});
