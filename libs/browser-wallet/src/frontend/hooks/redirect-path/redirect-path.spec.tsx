import { renderHook, waitFor } from '@testing-library/react';

import { type AppGlobals, useGlobalsStore } from '@/stores/globals';
import { mockStorage } from '@/test-helpers/mock-storage';
import { mockStore } from '@/test-helpers/mock-store';

import { FULL_ROUTES } from '../../routes/route-names';
import { useGetRedirectPath } from '.';

jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: () => ({ client: {} }),
}));

const mockLoadGlobals = jest.fn();

jest.mock('@/stores/globals');

const renderRedirectHook = (globals: AppGlobals, loading: boolean = false) => {
  mockStore(useGlobalsStore, {
    loading,
    globals,
    loadGlobals: mockLoadGlobals,
  });
  return renderHook(() => useGetRedirectPath(), {
    initialProps: false,
  });
};

describe('RedirectPath', () => {
  beforeEach(() => {
    mockStorage();
  });
  it('returns the wallets page by default', async () => {
    const view = renderRedirectHook({
      passphrase: true,
      locked: false,
      wallet: true,
      version: '0.0.1',
      settings: {
        telemetry: false,
      },
    });
    await waitFor(() => expect(view.result.current.loading).toBeFalsy());
    expect(view.result.current.path).toBe(FULL_ROUTES.wallets);
  });

  it('returns getting started if no password is set', async () => {
    const view = renderRedirectHook({
      passphrase: false,
      locked: false,
      wallet: true,
      version: '0.0.1',
      settings: {
        telemetry: false,
      },
    });
    await waitFor(() => expect(view.result.current.loading).toBeFalsy());
    expect(view.result.current.loading).toBeFalsy();
    expect(view.result.current.path).toBe(FULL_ROUTES.getStarted);
  });
  it('returns login if locked', async () => {
    const view = renderRedirectHook({
      passphrase: true,
      locked: true,
      wallet: true,
      version: '0.0.1',
      settings: {
        telemetry: false,
      },
    });
    await waitFor(() => expect(view.result.current.loading).toBeFalsy());
    expect(view.result.current.loading).toBeFalsy();
    expect(view.result.current.path).toBe(FULL_ROUTES.login);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('returns create wallet if no wallets exist', async () => {
    const view = renderRedirectHook({
      passphrase: true,
      locked: false,
      wallet: false,
      version: '0.0.1',
      settings: {
        telemetry: false,
      },
    });
    await waitFor(() => expect(view.result.current.loading).toBeFalsy());
    expect(view.result.current.loading).toBeFalsy();
    expect(view.result.current.path).toBe(FULL_ROUTES.createWallet);
  });

  it('returns telemetry if telemetry settings are undefined', async () => {
    const view = renderRedirectHook({
      passphrase: true,
      locked: false,
      wallet: true,
      version: '0.0.1',
      settings: {},
    });
    await waitFor(() => expect(view.result.current.loading).toBeFalsy());
    expect(view.result.current.loading).toBeFalsy();
    expect(view.result.current.path).toBe(FULL_ROUTES.wallets);
  });

  it('returns no path if loading', async () => {
    const view = renderRedirectHook(
      {
        passphrase: true,
        locked: false,
        wallet: true,
        version: '0.0.1',
        settings: {
          telemetry: false,
        },
      },
      true
    );
    await waitFor(() => expect(view.result.current.loading).toBeTruthy());
    expect(view.result.current.path).toBeNull();
  });
});
