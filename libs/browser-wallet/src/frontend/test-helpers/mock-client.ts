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
  // eslint-disable-next-line @typescript-eslint/ban-types
  const listeners: Function[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pushMessage = (message: any) => {
    // Set timeout to simulate async
    setTimeout(() => {
      // TODO this is a hack
      listeners[0](message);
    }, 50);
  };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.browser = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ...global.browser,
    runtime: {
      connect: () => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        postMessage: (message: any) => {
          switch (message.method) {
            case RpcMethods.ListWallets: {
              pushMessage({
                jsonrpc: '2.0',
                result: { wallets },
                id: message.id,
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
                id: message.id,
              });

              break;
            }
            case RpcMethods.GenerateRecoveryPhrase: {
              pushMessage({
                jsonrpc: '2.0',
                result: { recoveryPhrase: 'Word '.repeat(24) },
                id: message.id,
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
                id: message.id,
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
                id: message.id,
              });

              break;
            }
            case RpcMethods.Unlock: {
              if (message.params.passphrase === 'passphrase') {
                pushMessage({
                  jsonrpc: '2.0',
                  result: null,
                  id: message.id,
                });
              } else {
                pushMessage({
                  jsonrpc: '2.0',
                  error: {
                    code: 1,
                    message: 'Invalid passphrase or corrupted storage',
                  },
                  id: message.id,
                });
              }

              break;
            }
            case RpcMethods.ListConnections: {
              pushMessage({
                jsonrpc: '2.0',
                id: message.id,
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
                settings: message.params,
              };
              pushMessage({
                jsonrpc: '2.0',
                result: null,
                id: message.id,
              });

              break;
            }
            case RpcMethods.SignMessage: {
              pushMessage({
                jsonrpc: '2.0',
                result: { signature: 'signature' },
                id: message.id,
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
                ].includes(message.method)
              ) {
                pushMessage({
                  jsonrpc: '2.0',
                  result: null,
                  id: message.id,
                });
              } else {
                pushMessage({
                  jsonrpc: '2.0',
                  error: { code: -32_601, message: 'Method not found' },
                  id: message.id,
                });
              }
            }
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onmessage: (...arguments_: any[]) => {
          // eslint-disable-next-line no-console
          console.log('om', arguments_);
        },
        onMessage: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          addListener: (function_: any) => {
            listeners.push(function_);
          },
        },
        onDisconnect: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          addListener: (function_: any) => {},
        },
      }),
    },
  };
};
