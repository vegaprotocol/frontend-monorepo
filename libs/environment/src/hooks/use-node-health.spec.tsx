import { act, renderHook } from '@testing-library/react';
import { useNodeHealth, Health, INTERVAL_TIME } from './use-node-health';
import type { createClient } from '@vegaprotocol/apollo-client';
import type { ClientCollection } from './use-nodes';

function setup(...args: Parameters<typeof useNodeHealth>) {
  return renderHook(() => useNodeHealth(...args));
}

function createMockClient(blockHeight: string) {
  return {
    query: () =>
      Promise.resolve({
        data: {
          statistics: {
            chainId: 'chain-id',
            blockHeight,
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

const CURRENT_URL = 'https://n01.test.com';

describe('useNodeHealth', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  it('health is good if block height is equal', async () => {
    const clientCollection: ClientCollection = {
      [CURRENT_URL]: createMockClient('100'),
      'https://n02.test.com': createMockClient('100'),
      'https://n03.test.com': createMockClient('100'),
    };
    const { result } = setup(clientCollection, CURRENT_URL);
    await act(async () => {
      jest.advanceTimersByTime(INTERVAL_TIME);
    });
    expect(result.current).toBe(Health.Good);
  });

  it('health is good if block height with three blocks', async () => {
    const clientCollection: ClientCollection = {
      [CURRENT_URL]: createMockClient('97'),
      'https://n02.test.com': createMockClient('98'),
      'https://n03.test.com': createMockClient('100'),
    };
    const { result } = setup(clientCollection, CURRENT_URL);
    await act(async () => {
      jest.advanceTimersByTime(INTERVAL_TIME);
    });
    expect(result.current).toBe(Health.Good);
  });

  it('health is bad if block height behind', async () => {
    const clientCollection: ClientCollection = {
      [CURRENT_URL]: createMockClient('100'),
      'https://n02.test.com': createMockClient('200'),
      'https://n03.test.com': createMockClient('300'),
    };
    const { result } = setup(clientCollection, CURRENT_URL);
    await act(async () => {
      jest.advanceTimersByTime(INTERVAL_TIME);
    });
    expect(result.current).toBe(Health.Bad);
  });

  it('health is critical if query rejects', async () => {
    const clientCollection: ClientCollection = {
      [CURRENT_URL]: createRejectingClient(),
      'https://n02.test.com': createMockClient('200'),
      'https://n03.test.com': createMockClient('102'),
    };
    const { result } = setup(clientCollection, CURRENT_URL);
    await act(async () => {
      jest.advanceTimersByTime(INTERVAL_TIME);
    });
    expect(result.current).toBe(Health.Critical);
  });

  it('health is critical if query returns an error', async () => {
    const clientCollection: ClientCollection = {
      [CURRENT_URL]: createErroringClient(),
      'https://n02.test.com': createMockClient('200'),
      'https://n03.test.com': createMockClient('102'),
    };
    const { result } = setup(clientCollection, CURRENT_URL);
    await act(async () => {
      jest.advanceTimersByTime(INTERVAL_TIME);
    });
    expect(result.current).toBe(Health.Critical);
  });
});
