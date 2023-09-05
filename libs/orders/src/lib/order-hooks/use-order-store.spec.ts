import {
  getDefaultOrder,
  STORAGE_KEY,
  useOrder,
  useCreateOrderStore,
} from './use-order-store';
import { act, renderHook } from '@testing-library/react';
import { OrderType } from '@vegaprotocol/types';

jest.mock('zustand');

describe('useCreateOrderStore', () => {
  const setup = () => {
    const { result } = renderHook(() => useCreateOrderStore());
    return renderHook(() => result.current());
  };

  afterEach(() => {
    localStorage.clear();
  });

  it('has a empty default state', async () => {
    const { result } = setup();
    expect(result.current).toEqual({
      orders: {},
      update: expect.any(Function),
    });
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
  });
});

describe('useOrder', () => {
  const setup = (marketId: string) => {
    return renderHook(() => useOrder(marketId));
  };

  afterEach(() => {
    localStorage.clear();
  });

  it('creates a new order if it doesnt exist which is only persisted after editing', () => {
    const marketId = 'market-id';
    const expectedOrder = {
      ...getDefaultOrder(marketId),
      persist: false,
    };
    const { result } = setup(marketId);
    expect(result.current).toEqual([expectedOrder, expect.any(Function)]);
  });

  it('only persists an order if edited', () => {
    const marketId = 'market-id';
    const expectedOrder = {
      ...getDefaultOrder(marketId),
      persist: false,
    };
    const { result } = setup(marketId);
    expect(result.current[0]).toMatchObject({
      price: expectedOrder.price,
      persist: false,
    });

    const update = { price: '500' };
    act(() => {
      result.current[1](update);
    });

    expect(result.current[0]).toMatchObject({
      ...update,
      persist: true,
    });
  });
});
