import { act, renderHook } from '@testing-library/react';
import type { Transaction } from './connectors';
import { ViewConnector, JsonRpcConnector } from './connectors';
import { useVegaWallet } from './use-vega-wallet';
import type { VegaWalletConfig } from './provider';
import { VegaWalletProvider } from './provider';
import { LocalStorage } from '@vegaprotocol/utils';
import type { ReactNode } from 'react';
import { WALLET_KEY } from './storage';

const jsonRpcConnector = new JsonRpcConnector();
const viewConnector = new ViewConnector();

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

const setup = (config?: Partial<VegaWalletConfig>) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <VegaWalletProvider config={{ ...defaultConfig, ...config }}>
      {children}
    </VegaWalletProvider>
  );
  return renderHook(() => useVegaWallet(), { wrapper });
};

describe('VegaWalletProvider', () => {
  afterAll(() => {
    localStorage.clear();
  });

  const mockPubKeys = [
    { publicKey: '111', name: 'public key 1' },
    { publicKey: '222', name: 'public key 2' },
  ];
  const spyOnConnect = jest
    .spyOn(jsonRpcConnector, 'connect')
    .mockImplementation(() => Promise.resolve(mockPubKeys));
  const spyOnSend = jest
    .spyOn(jsonRpcConnector, 'sendTx')
    .mockImplementation(() =>
      Promise.resolve({
        transactionHash: 'tsx',
        sentAt: '',
        receivedAt: '',
        signature: '',
      })
    );
  const storageSpy = jest.spyOn(LocalStorage, 'setItem');
  const spyOnDisconnect = jest
    .spyOn(jsonRpcConnector, 'disconnect')
    .mockImplementation(() => Promise.resolve());

  it('connects, disconnects and retrieve keypairs', async () => {
    const { result } = setup();

    // Default state
    expect(result.current).toEqual({
      network: defaultConfig.network,
      vegaUrl: defaultConfig.vegaUrl,
      vegaWalletServiceUrl: defaultConfig.vegaWalletServiceUrl,
      acknowledgeNeeded: false,
      pubKey: null,
      pubKeys: null,
      isReadOnly: false,
      selectPubKey: expect.any(Function),
      connect: expect.any(Function),
      disconnect: expect.any(Function),
      sendTx: expect.any(Function),
      fetchPubKeys: expect.any(Function || undefined),
      links: {
        about: expect.any(String),
        browserList: expect.any(String),
        ...defaultConfig.links,
      },
    });

    // Connect
    await act(async () => {
      result.current.connect(jsonRpcConnector);
    });
    expect(spyOnConnect).toHaveBeenCalled();
    expect(result.current.pubKeys).toHaveLength(mockPubKeys.length);
    expect(result.current.pubKey).toBe(mockPubKeys[0].publicKey);

    // Change current pubkey
    await act(async () => {
      result.current.selectPubKey(mockPubKeys[1].publicKey);
    });
    expect(result.current.pubKey).toBe(mockPubKeys[1].publicKey);
    expect(storageSpy).toHaveBeenCalledWith(
      WALLET_KEY,
      mockPubKeys[1].publicKey
    );

    // Send tx
    await act(async () => {
      result.current.sendTx(mockPubKeys[1].publicKey, {} as Transaction);
    });
    expect(spyOnSend).toHaveBeenCalledWith(mockPubKeys[1].publicKey, {});
  });

  it('should fetch new keypairs', async () => {
    const { result } = setup();

    // Default state
    expect(result.current.pubKey).toEqual(null);

    // Connect
    await act(async () => {
      result.current.connect(jsonRpcConnector);
      result.current.selectPubKey(mockPubKeys[0].publicKey);
    });
    expect(spyOnConnect).toHaveBeenCalled();
    expect(result.current.pubKeys).toHaveLength(mockPubKeys.length);
    expect(result.current.pubKey).toBe(mockPubKeys[0].publicKey);

    // Fetch pub keys
    mockPubKeys.push({ publicKey: '333', name: 'public key 3' });
    await act(async () => {
      result.current.fetchPubKeys && result.current.fetchPubKeys();
    });
    expect(result.current.pubKeys).toHaveLength(mockPubKeys.length);
  });

  it('persists selected pubkey and disconnects', async () => {
    const { result } = setup();
    expect(result.current.pubKey).toBe(null);

    await act(async () => {
      result.current.connect(jsonRpcConnector);
      result.current.selectPubKey(mockPubKeys[0].publicKey);
    });

    expect(result.current.pubKey).toBe(mockPubKeys[0].publicKey);

    // Disconnect
    await act(async () => {
      result.current.disconnect();
    });
    expect(result.current.pubKey).toBe(null);
    expect(result.current.pubKeys).toBe(null);
    expect(spyOnDisconnect).toHaveBeenCalled();
    expect(localStorage.getItem(WALLET_KEY)).toBe(null);
  });

  it('sets isReadOnly to true if using view connector', async () => {
    jest
      .spyOn(viewConnector, 'connect')
      .mockImplementation(() => Promise.resolve(mockPubKeys));
    const { result } = setup();
    expect(result.current.pubKey).toBe(null);

    await act(async () => {
      result.current.connect(viewConnector);
    });
    expect(result.current.isReadOnly).toBe(true);
  });

  it('acknowledgeNeeded will set on', async () => {
    jest
      .spyOn(viewConnector, 'connect')
      .mockImplementation(() => Promise.resolve(mockPubKeys));

    const { result } = setup({ network: 'MAINNET' });

    expect(result.current.acknowledgeNeeded).toBe(true);

    await act(async () => {
      result.current.connect(viewConnector);
    });
    expect(result.current.isReadOnly).toBe(true);
  });
});
