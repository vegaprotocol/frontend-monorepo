import { mockChain } from './chains';
import { MockConnector, mockKeys } from './connectors';
import { ConnectorErrors } from './errors';
import { createConfig, STORE_KEY } from './wallet';

beforeEach(() => {
  localStorage.removeItem(STORE_KEY);
});

describe('chainId', () => {
  const mockConnector = new MockConnector();

  it('uses the default chainId', () => {
    const config = createConfig({
      chains: [mockChain],
      defaultChainId: mockChain.id,
      connectors: [mockConnector],
    });

    expect(config.store.getState().chainId).toEqual(mockChain.id);
  });

  it('handles invalid configuration', () => {
    expect(() => {
      createConfig({
        chains: [mockChain],
        defaultChainId: 'invalid chain id',
        connectors: [mockConnector],
      });
    }).toThrow();
  });
});

describe('connect', () => {
  const mockConnector = new MockConnector();
  const config = createConfig({
    chains: [mockChain],
    defaultChainId: mockChain.id,
    connectors: [mockConnector],
  });

  it('handles invalid connector', async () => {
    // @ts-expect-error deliberate wrong connector type
    const result = await config.connect('invalid connector');
    expect(result).toEqual({ status: 'disconnected' });
    expect(config.store.getState()).toMatchObject({
      status: 'disconnected',
      error: ConnectorErrors.noConnector,
      current: undefined,
      keys: [],
      pubKey: undefined,
    });
  });

  it('can connect', async () => {
    const spyConnect = jest.spyOn(mockConnector, 'connectWallet');
    const spyOn = jest.spyOn(mockConnector, 'on');
    const spyOff = jest.spyOn(mockConnector, 'off');

    const result = await config.connect('mock');

    expect(config.store.getState()).toMatchObject({
      status: 'connected',
      keys: mockKeys,
      pubKey: mockKeys[0].publicKey,
    });

    expect(spyConnect).toHaveBeenCalledTimes(1);
    expect(spyConnect).toHaveBeenCalledWith(mockChain.id);
    expect(spyOff).toHaveBeenCalledWith('client.disconnected');
    expect(spyOn).toHaveBeenCalledWith(
      'client.disconnected',
      expect.any(Function)
    );

    expect(result).toEqual({ status: 'connected' });
  });
});

describe('disconnect', () => {
  const mockConnector = new MockConnector();
  const config = createConfig({
    chains: [mockChain],
    defaultChainId: mockChain.id,
    connectors: [mockConnector],
  });

  it('handles invalid connector', async () => {
    const result = await config.disconnect();
    expect(result).toEqual({ status: 'disconnected' });
    expect(config.store.getState()).toMatchObject({
      status: 'disconnected',
      error: ConnectorErrors.noConnector,
      current: undefined,
      keys: [],
      pubKey: undefined,
    });
  });

  it('can disconnect', async () => {
    const spyOff = jest.spyOn(mockConnector, 'off');
    const spyDisconnect = jest.spyOn(mockConnector, 'disconnectWallet');

    await config.connect('mock');
    expect(config.store.getState().status).toBe('connected');
    const result = await config.disconnect();
    expect(spyOff).toHaveBeenCalledWith('client.disconnected');
    expect(spyDisconnect).toHaveBeenCalledTimes(1);
    expect(config.store.getState()).toMatchObject({
      status: 'disconnected',
      keys: [],
      pubKey: undefined,
      current: undefined,
    });
    expect(result).toEqual({ status: 'disconnected' });
  });
});

describe('refresh keys', () => {
  const mockConnector = new MockConnector();
  const config = createConfig({
    chains: [mockChain],
    defaultChainId: mockChain.id,
    connectors: [mockConnector],
  });

  it('handles invalid connector', async () => {
    await config.refreshKeys();
    expect(config.store.getState()).toMatchObject({
      error: ConnectorErrors.noConnector,
    });
  });

  it('can refresh to get newly created keys', async () => {
    await config.connect('mock');
    expect(config.store.getState().status).toBe('connected');

    const keys = [...mockKeys, { name: 'New key', publicKey: '123' }];
    jest.spyOn(mockConnector, 'listKeys').mockResolvedValue(keys);

    await config.refreshKeys();
    expect(config.store.getState().keys).toHaveLength(keys.length);
    expect(config.store.getState()).toMatchObject({
      keys: keys,
    });
  });
});

describe('sendTransaction', () => {
  const params = {
    sendingMode: 'TYPE_SYNC',
    publicKey: '123',
    transaction: {
      joinTeam: {
        id: '123',
      },
    },
  } as const;

  it('handles sending before connected', async () => {
    const mockConnector = new MockConnector();
    const config = createConfig({
      chains: [mockChain],
      defaultChainId: mockChain.id,
      connectors: [mockConnector],
    });

    await expect(config.sendTransaction(params)).rejects.toEqual(
      ConnectorErrors.noConnector
    );
  });

  it('handles connector error', async () => {
    const mockConnector = new MockConnector();
    const config = createConfig({
      chains: [mockChain],
      defaultChainId: mockChain.id,
      connectors: [mockConnector],
    });

    jest
      .spyOn(mockConnector, 'sendTransaction')
      .mockRejectedValue(ConnectorErrors.userRejected);

    await config.connect('mock');

    expect(config.store.getState().status).toBe('connected');

    await expect(config.sendTransaction(params)).rejects.toEqual(
      ConnectorErrors.userRejected
    );
  });

  it('can send transaction', async () => {
    const mockConnector = new MockConnector();
    const config = createConfig({
      chains: [mockChain],
      defaultChainId: mockChain.id,
      connectors: [mockConnector],
    });

    const spySendTx = jest.spyOn(mockConnector, 'sendTransaction');

    await config.connect('mock');

    expect(config.store.getState().status).toBe('connected');

    const tx = await config.sendTransaction(params);

    expect(tx).toMatchObject({
      transactionHash: expect.any(String),
      signature: expect.any(String),
      sentAt: expect.any(String),
      receivedAt: expect.any(String),
    });
    expect(spySendTx).toHaveBeenCalledTimes(1);
    expect(spySendTx).toHaveBeenCalledWith(params);
  });
});
