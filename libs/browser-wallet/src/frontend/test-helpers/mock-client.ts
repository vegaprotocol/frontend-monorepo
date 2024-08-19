/* istanbul ignore file */

// TODO We are getting to the point where a dumb mock client is not good enough
// need to investigate a better mocking solution]

import { RpcMethods } from '@/lib/client-rpc-methods';
import type { AppGlobals } from '@/stores/globals';
import type { Key } from '@/types/backend';

const defaultWallets = ['wallet 1'];
const defaultKeys = [
  {
    publicKey:
      '07248acbd899061ba9c5f3ab47791df2045c8e249f1805a04c2a943160533673',
    name: 'Key 1',
    index: 0,
  },
];
const defaultGlobals = {
  passphrase: true,
  wallet: true,
  version: '0.0.1',
  locked: false,
  settings: {
    telemetry: false,
  },
};

export const mockClient = (
  wallets: string[] = defaultWallets,
  keys: Key[] = defaultKeys,
  globals?: Partial<AppGlobals>
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pushMessage = (message: any) => {
    console.log('sending', message);
    setTimeout(
      () =>
        window.dispatchEvent(
          new CustomEvent('popup-response', { detail: message })
        ),
      50
    );
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lst = (message: any) => {
    const msg = message.detail;
    switch (msg.method) {
      case RpcMethods.ListWallets: {
        pushMessage({
          jsonrpc: '2.0',
          result: { wallets },
          id: msg.id,
        });
        break;
      }
      case RpcMethods.ListKeys: {
        pushMessage({
          jsonrpc: '2.0',
          result: {
            keys: [
              {
                publicKey:
                  '07248acbd899061ba9c5f3ab47791df2045c8e249f1805a04c2a943160533673',
                name: 'Key 1',
              },
            ],
          },
          id: msg.id,
        });
        break;
      }
      case RpcMethods.GenerateRecoveryPhrase: {
        pushMessage({
          jsonrpc: '2.0',
          result: { recoveryPhrase: 'Word '.repeat(24) },
          id: msg.id,
        });
        break;
      }
      case RpcMethods.GenerateKey: {
        pushMessage({
          jsonrpc: '2.0',
          result: {
            publicKey:
              '17248acbd899061ba9c5f3ab47791df2045c8e249f1805a04c2a943160533673',
            name: 'Key 2',
            index: 0,
          },
          id: msg.id,
        });
        break;
      }
      case RpcMethods.AppGlobals: {
        pushMessage({
          jsonrpc: '2.0',
          result: {
            ...defaultGlobals,
            ...globals,
          },
          id: msg.id,
        });
        break;
      }
      case RpcMethods.Unlock: {
        if (msg.params.passphrase === 'passphrase') {
          pushMessage({
            jsonrpc: '2.0',
            result: null,
            id: msg.id,
          });
        } else {
          pushMessage({
            jsonrpc: '2.0',
            error: {
              code: 1,
              message: 'Invalid passphrase or corrupted storage',
            },
            id: msg.id,
          });
        }
        break;
      }
      case RpcMethods.ListConnections: {
        pushMessage({
          jsonrpc: '2.0',
          id: msg.id,
          result: {
            connections: [
              {
                allowList: {
                  publicKeys: [],
                  wallets: ['Wallet 1'],
                },
                accessedAt: 1,
                origin: 'https://vega.xyz',
                chainId: 'foo',
                networkId: 'bar',
              },
              {
                allowList: {
                  publicKeys: [],
                  wallets: ['Wallet 1'],
                },
                accessedAt: 2,
                origin: 'foo.com',
                chainId: 'foo',
                networkId: 'bar',
              },
            ],
          },
        });
        break;
      }
      case RpcMethods.UpdateSettings: {
        // TODO this is a hack. We are getting to the point where a dumb mock client is not good enough
        // need to investigate a better mocking solution]
        globals = {
          ...defaultGlobals,
          ...globals,
          settings: msg.params,
        };
        pushMessage({
          jsonrpc: '2.0',
          result: null,
          id: msg.id,
        });
        break;
      }
      case RpcMethods.SignMessage: {
        pushMessage({
          jsonrpc: '2.0',
          result: { signature: 'signature' },
          id: msg.id,
        });
        break;
      }
      default: {
        if (
          [
            RpcMethods.ImportWallet,
            RpcMethods.Lock,
            RpcMethods.RemoveConnection,
            RpcMethods.OpenPopout,
            RpcMethods.CreatePassphrase,
          ].includes(msg.method)
        ) {
          pushMessage({
            jsonrpc: '2.0',
            result: null,
            id: msg.id,
          });
        } else {
          pushMessage({
            jsonrpc: '2.0',
            error: { code: -32_601, message: 'Method not found' },
            id: msg.id,
          });
        }
      }
    }
  };
  window.removeEventListener('popup', lst);
  window.addEventListener('popup', lst);
};
