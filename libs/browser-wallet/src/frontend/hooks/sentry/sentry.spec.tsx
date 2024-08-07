// import { close, init, setTag } from '@sentry/react'
// import { renderHook } from '@testing-library/react'

// import { MockNetworkProvider } from '@/contexts/network/mock-network-provider'
// import { useGlobalsStore } from '@/stores/globals'
// import { useWalletStore } from '@/stores/wallets'
// import { mockStore } from '@/test-helpers/mock-store'

import { sanitizeEvent } from '../../lib/sanitize-event';
// import { useSentry } from '.'

jest.mock('@/stores/globals');
jest.mock('@/stores/wallets');
// jest.mock('@sentry/react')
// jest.mock('!/config', () => ({
//   ...jest.requireActual('../../../config/test').default,
//   sentryDsn: 'dsn',
// }));

jest.mock('@sentry/react', () => ({
  init: jest.fn(),
  close: jest.fn(),
  setTag: jest.fn(),
}));

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('useSentry', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  // it('should initialize Sentry when telemetry is enabled and config is available', () => {
  //   mockStore(useGlobalsStore, {
  //     globals: {
  //       settings: {
  //         telemetry: true
  //       },
  //       version: '1.0.0'
  //     }
  //   })
  //   mockStore(useWalletStore, {
  //     wallets: []
  //   })

  //   renderHook(() => useSentry(), { wrapper: MockNetworkProvider })

  //   expect(init).toHaveBeenCalledWith({
  //     dsn: 'dsn',
  //     integrations: [],
  //     release: '@vegaprotocol/vegawallet-browser@1.0.0',
  //     beforeSend: expect.any(Function)
  //   })

  //   expect(setTag).toHaveBeenCalledWith('version', '1.0.0')
  //   expect(close).not.toHaveBeenCalled()
  // })

  // it('should close Sentry when telemetry is disabled', () => {
  //   mockStore(useGlobalsStore, {
  //     globals: {
  //       settings: {
  //         telemetry: false
  //       },
  //       version: '1.0.0'
  //     }
  //   })
  //   mockStore(useWalletStore, {
  //     wallets: []
  //   })

  //   renderHook(() => useSentry(), { wrapper: MockNetworkProvider })

  //   expect(init).not.toHaveBeenCalled()
  //   expect(setTag).not.toHaveBeenCalled()
  //   expect(close).toHaveBeenCalled()
  // })

  it('should sanitize event by replacing wallet keys with [VEGA_KEY]', () => {
    const event = JSON.stringify(
      sanitizeEvent(
        {
          message:
            'name1, name2, publicKey1, publicKey2, publicKey3, publicKey2, name2',
        } as any,
        ['name1', 'name2'],
        ['publicKey1', 'publicKey2', 'publicKey3']
      )
    );

    expect(event).not.toContain('name1');
    expect(event).not.toContain('name2');
    expect(event).not.toContain('publicKey1');
    expect(event).not.toContain('publicKey2');
    expect(event).not.toContain('publicKey3');
    expect(event).toContain('[VEGA_KEY]');
    expect(event).toContain('[WALLET_NAME]');
  });
});
