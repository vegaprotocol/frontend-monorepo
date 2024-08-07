/* eslint-disable @typescript-eslint/no-explicit-any */
import { RpcMethods } from '@/lib/client-rpc-methods';

import { useWalletStore } from './wallets';

const keys = [
  {
    publicKey:
      '07248acbd899061ba9c5f3ab47791df2045c8e249f1805a04c2a943160533673',
    name: 'Key 1',
    index: 0,
  },
];

const request = (method: string) => {
  switch (method) {
    case RpcMethods.ListWallets: {
      return { wallets: ['Wallet 1'] };
    }
    case RpcMethods.ListKeys: {
      return {
        keys,
      };
    }
    case RpcMethods.GenerateKey: {
      return {
        publicKey:
          '17248acbd899061ba9c5f3ab47791df2045c8e249f1805a04c2a943160533673',
        name: 'Key 2',
      };
    }
    // No default
  }
};

const initialState = useWalletStore.getState();

const fakeRequest = () => {
  // eslint-disable-next-line no-throw-literal
  throw null;
};

describe('Store', () => {
  beforeEach(() => {
    useWalletStore.setState(initialState);
  });
  it('loads wallets from backend', async () => {
    expect(useWalletStore.getState().loading).toBe(true);
    expect(useWalletStore.getState().wallets).toStrictEqual([]);
    await useWalletStore.getState().loadWallets(request as unknown as any);
    expect(useWalletStore.getState().loading).toBe(false);
    expect(useWalletStore.getState().wallets).toStrictEqual([
      {
        keys,
        name: 'Wallet 1',
      },
    ]);
  });

  it('throws error if the wallet we are trying to create a key for could not be found', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(
      async () =>
        await useWalletStore
          .getState()
          .createKey(
            fakeRequest as unknown as any,
            'this wallet name does not exist'
          )
    ).rejects.toThrow('Could not find wallet to create key for');
  });
  it('adds a new key onto wallet when creating a new key for that wallet', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await useWalletStore.getState().loadWallets(request as unknown as any);
    await useWalletStore
      .getState()
      .createKey(request as unknown as any, 'Wallet 1');
    expect(useWalletStore.getState().wallets[0].keys).toHaveLength(2);
    const [key1, key2] = useWalletStore.getState().wallets[0].keys;
    expect(key1.name).toBe('Key 1');
    expect(key2.name).toBe('Key 2');
  });
  it('retrieves key info based on public key', async () => {
    await useWalletStore.getState().loadWallets(request as unknown as any);

    // Test when the key exists in the wallet
    const result1 = useWalletStore.getState().getKeyById(keys[0].publicKey);
    expect(result1?.name).toBe('Key 1');

    // Test when the key doesn't exist in the wallet
    const result2 = useWalletStore
      .getState()
      .getKeyById('nonexistent_public_key');
    expect(result2).toBeUndefined();
  });
});
