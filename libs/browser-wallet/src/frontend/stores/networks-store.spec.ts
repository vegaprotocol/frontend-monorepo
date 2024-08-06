import { RpcMethods } from '@/lib/client-rpc-methods';
import { silenceErrors } from '@/test-helpers/silence-errors';

import { fairground, testingNetwork } from '../../config/well-known-networks';
import { useNetworksStore } from './networks-store';

const initialState = useNetworksStore.getState();

const globalsMock = {
  passphrase: true,
  locked: false,
  wallet: true,
  version: '0.0.1',
  settings: {
    selectedNetwork: fairground.id,
  },
};

const request = jest.fn().mockImplementation(async (method: string) => {
  switch (method) {
    case RpcMethods.ListNetworks: {
      return { networks: [testingNetwork, fairground] };
    }
    case RpcMethods.AppGlobals: {
      return globalsMock;
    }
    case RpcMethods.UpdateSettings: {
      return null;
    }
    // No default
  }
  throw new Error('RPC method not in mock');
});

describe('NetworksStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNetworksStore.setState(initialState);
  });
  it('loads networks', async () => {
    expect(useNetworksStore.getState().loading).toBe(true);
    expect(useNetworksStore.getState().networks).toStrictEqual([]);
    expect(useNetworksStore.getState().selectedNetwork).toBeNull();
    await useNetworksStore.getState().loadNetworks(request);
    expect(useNetworksStore.getState().loading).toBe(false);
    expect(useNetworksStore.getState().networks).toStrictEqual([
      testingNetwork,
      fairground,
    ]);
    expect(useNetworksStore.getState().selectedNetwork).toStrictEqual(
      fairground
    );
  });
  it('throws error if selected network cannot be found', async () => {
    const net = globalsMock.settings.selectedNetwork;
    globalsMock.settings.selectedNetwork = 'foo';
    await expect(
      useNetworksStore.getState().loadNetworks(request)
    ).rejects.toThrow('Could not find selected network foo');

    globalsMock.settings.selectedNetwork = net;
  });
  it('sets selected network to be the first network if selected network cannot be found', async () => {
    const net = globalsMock.settings.selectedNetwork;
    // @ts-ignore
    globalsMock.settings.selectedNetwork = undefined;
    await useNetworksStore.getState().loadNetworks(request);
    expect(useNetworksStore.getState().selectedNetwork).toStrictEqual(
      testingNetwork
    );
    globalsMock.settings.selectedNetwork = net;
  });
  it('gets network by networkId', async () => {
    await useNetworksStore.getState().loadNetworks(request);
    const result = useNetworksStore.getState().getNetworkById(fairground.id);
    expect(result).toStrictEqual(fairground);
    const result2 = useNetworksStore.getState().getNetworkById('foo');
    expect(result2).toBeUndefined();
  });

  it('allows user to set selected network', async () => {
    await useNetworksStore.setState({ networks: [testingNetwork] });
    await useNetworksStore
      .getState()
      .setSelectedNetwork(request, testingNetwork.id);
    expect(request).toHaveBeenCalledWith(RpcMethods.UpdateSettings, {
      selectedNetwork: testingNetwork.id,
    });
    expect(useNetworksStore.getState().selectedNetwork).toStrictEqual(
      testingNetwork
    );
  });

  it('throws error if attempting to select non-existent network', async () => {
    silenceErrors();
    await expect(() =>
      useNetworksStore.getState().setSelectedNetwork(request, 'foo')
    ).rejects.toThrow(`Could not find network foo`);
  });
});
