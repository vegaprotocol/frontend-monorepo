import { act, renderHook } from '@testing-library/react';
import {
  useNodeHealth,
  NODE_SUBSET_COUNT,
  INTERVAL_TIME,
} from './use-node-health';
import type { createClient } from '@vegaprotocol/apollo-client';
import type { ClientCollection } from './use-nodes';

function setup(...args: Parameters<typeof useNodeHealth>) {
  return renderHook(() => useNodeHealth(...args));
}

function createMockClient(blockHeight: number) {
  return {
    query: jest.fn().mockResolvedValue({
      data: {
        statistics: {
          chainId: 'chain-id',
          blockHeight: blockHeight.toString(),
        },
      },
    }),
  } as unknown as ReturnType<typeof createClient>;
}

function createRejectingClient() {
  return {
    query: () => Promise.reject(new Error('request failed')),
  } as unknown as ReturnType<typeof createClient>;
}

function createErroringClient() {
  return {
    query: () =>
      Promise.resolve({
        error: new Error('failed'),
      }),
  } as unknown as ReturnType<typeof createClient>;
}

const CURRENT_URL = 'https://current.test.com';

describe('useNodeHealth', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  it('provides difference between the highest block and the current block', async () => {
    const highest = 100;
    const curr = 97;
    const clientCollection: ClientCollection = {
      [CURRENT_URL]: createMockClient(curr),
      'https://n02.test.com': createMockClient(98),
      'https://n03.test.com': createMockClient(highest),
    };
    const { result } = setup(clientCollection, CURRENT_URL);
    await act(async () => {
      jest.advanceTimersByTime(INTERVAL_TIME);
    });
    expect(result.current).toBe(highest - curr);
  });

  it('returns -1 if the current node query fails', async () => {
    const clientCollection: ClientCollection = {
      [CURRENT_URL]: createRejectingClient(),
      'https://n02.test.com': createMockClient(200),
      'https://n03.test.com': createMockClient(102),
    };
    const { result } = setup(clientCollection, CURRENT_URL);
    await act(async () => {
      jest.advanceTimersByTime(INTERVAL_TIME);
    });
    expect(result.current).toBe(-1);
  });

  it('returns -1 if the current node query returns an error', async () => {
    const clientCollection: ClientCollection = {
      [CURRENT_URL]: createErroringClient(),
      'https://n02.test.com': createMockClient(200),
      'https://n03.test.com': createMockClient(102),
    };
    const { result } = setup(clientCollection, CURRENT_URL);
    await act(async () => {
      jest.advanceTimersByTime(INTERVAL_TIME);
    });
    expect(result.current).toBe(-1);
  });

  it('queries against 5 random nodes along with the current url', async () => {
    const clientCollection: ClientCollection = new Array(20)
      .fill(null)
      .reduce((obj, x, i) => {
        obj[`https://n${i}.test.com`] = createMockClient(100);
        return obj;
      }, {} as ClientCollection);
    clientCollection[CURRENT_URL] = createMockClient(100);
    const spyOnCurrent = jest.spyOn(clientCollection[CURRENT_URL], 'query');

    const { result } = setup(clientCollection, CURRENT_URL);
    await act(async () => {
      jest.advanceTimersByTime(INTERVAL_TIME);
    });

    let count = 0;
    Object.values(clientCollection).forEach((client) => {
      // @ts-ignore jest.fn() in client setup means mock will be present
      if (client?.query.mock.calls.length) {
        count++;
      }
    });

    expect(count).toBe(NODE_SUBSET_COUNT + 1);
    expect(spyOnCurrent).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(0);
  });
});
