import { act, renderHook, waitFor } from '@testing-library/react';
import { Status, useInjectedConnector } from './use-injected-connector';
import type { ReactNode } from 'react';
import type { VegaWalletConfig } from './provider';
import { VegaWalletProvider } from './provider';
import { InjectedConnector } from './connectors';
import { mockBrowserWallet } from './test-helpers';

const defaultConfig: VegaWalletConfig = {
  network: 'TESTNET',
  vegaUrl: 'https://vega.xyz',
  vegaWalletServiceUrl: 'https://vegaservice.xyz',
  links: {
    explorer: 'explorer-link',
    concepts: 'concepts-link',
    chromeExtensionUrl: 'chrome-link',
    mozillaExtensionUrl: 'mozilla-link',
  },
};

const setup = (callback = jest.fn(), config?: Partial<VegaWalletConfig>) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <VegaWalletProvider config={{ ...defaultConfig, ...config }}>
      {children}
    </VegaWalletProvider>
  );
  return renderHook(() => useInjectedConnector(callback), { wrapper });
};

const injected = new InjectedConnector();

describe('useInjectedConnector', () => {
  it('attempts connection', async () => {
    const { result } = setup();
    expect(typeof result.current.connect).toBe('function');
    expect(result.current.status).toBe(Status.Idle);
    expect(result.current.error).toBe(null);
  });

  it('errors if vega not injected', async () => {
    const { result } = setup();
    await act(async () => {
      result.current.connect(injected, '1');
    });
    expect(result.current.error?.message).toBe('window.vega not found');
    expect(result.current.status).toBe(Status.Error);
  });

  it('errors if chain ids dont match', async () => {
    mockBrowserWallet();
    const { result } = setup();
    await act(async () => {
      result.current.connect(injected, '2'); // default mock chainId is '1'
    });
    expect(result.current.error?.message).toBe('Invalid chain');
    expect(result.current.status).toBe(Status.Error);
  });

  it('errors if connection throws', async () => {
    const callback = jest.fn();
    mockBrowserWallet({
      getChainId: () => Promise.reject('failed'),
    });
    const { result } = setup(callback);

    await act(async () => {
      result.current.connect(injected, '1'); // default mock chainId is '1'
    });
    expect(result.current.status).toBe(Status.Error);
    expect(result.current.error?.message).toBe('injected connection failed');
  });

  it('connects', async () => {
    const callback = jest.fn();
    const vega = mockBrowserWallet();
    const { result } = setup(callback);

    act(() => {
      result.current.connect(injected, '1'); // default mock chainId is '1'
    });
    expect(result.current.status).toBe(Status.GettingChainId);

    await waitFor(() => {
      expect(vega.connectWallet).toHaveBeenCalled();
      expect(vega.listKeys).toHaveBeenCalled();
    });

    expect(result.current.status).toBe(Status.Connected);
    expect(callback).toHaveBeenCalled();
  });

  it('connects when aknowledgement required', async () => {
    const callback = jest.fn();
    const vega = mockBrowserWallet();
    const { result } = setup(callback, { network: 'MAINNET' });

    act(() => {
      result.current.connect(injected, '1'); // default mock chainId is '1'
    });

    await waitFor(() => {
      expect(vega.listKeys).toHaveBeenCalled();
    });

    expect(result.current.status).toBe(Status.AcknowledgeNeeded);
    expect(callback).not.toHaveBeenCalled();
  });
});
