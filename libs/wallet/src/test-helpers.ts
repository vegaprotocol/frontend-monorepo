export function mockBrowserWallet(overrides?: Partial<Vega>) {
  const vega: Vega = {
    connectWallet: jest.fn().mockReturnValue(Promise.resolve(null)),
    disconnectWallet: jest.fn().mockReturnValue(Promise.resolve()),
    listKeys: jest
      .fn()
      .mockReturnValue({ keys: [{ name: 'test key', publicKey: '0x123' }] }),
    sendTransaction: jest.fn().mockReturnValue({
      code: 1,
      data: '',
      height: '1',
      log: '',
      success: true,
      txHash: '0x123',
    }),
    on: jest.fn(),
    isConnected: jest.fn().mockRejectedValue(Promise.resolve(true)),
    ...overrides,
  };
  // @ts-ignore globalThis has no index signature
  globalThis.vega = vega;
  return vega;
}

export function clearBrowserWallet() {
  // @ts-ignore no index signature on globalThis
  delete globalThis['vega'];
}

export function delayedResolve<T>(result: T, delay = 0): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(result), delay);
  });
}

export function delayedReject<T>(result: T, delay = 0): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(result), delay);
  });
}
