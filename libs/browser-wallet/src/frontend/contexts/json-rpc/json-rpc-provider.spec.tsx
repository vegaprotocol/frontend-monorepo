import { render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';

import { RpcMethods } from '@/lib/client-rpc-methods';
import { ServerRpcMethods } from '@/lib/server-rpc-methods';
import { useConnectionStore } from '@/stores/connections';
import { useErrorStore } from '@/stores/error';
import { useInteractionStore } from '@/stores/interaction-store';
import { mockClient } from '@/test-helpers/mock-client';
import { mockStore } from '@/test-helpers/mock-store';
import { silenceErrors } from '@/test-helpers/silence-errors';

import { useJsonRpcClient } from './json-rpc-context';
import { JsonRPCProvider } from './json-rpc-provider';

jest.mock('@/stores/interaction-store');
jest.mock('@/stores/error');
jest.mock('@/stores/connections');

const mockModalStore = () => {
  const store = useInteractionStore as jest.MockedFunction<
    typeof useInteractionStore
  >;
  const handleConnection = jest.fn();
  const handleTransaction = jest.fn();
  store.mockImplementation(() => ({
    handleConnection,
    handleTransaction,
  }));
  return {
    handleConnection,
    handleTransaction,
  };
};

const mockConnectionStore = () => {
  const store = useConnectionStore as jest.MockedFunction<
    typeof useConnectionStore
  >;
  const addConnection = jest.fn();
  store.mockImplementation(() => ({
    addConnection,
  }));
  return {
    addConnection,
  };
};

const mockErrorStore = () => {
  const setError = jest.fn();
  mockStore(useErrorStore, {
    setError,
  });
  return {
    setError,
  };
};

const TestComponent = ({ expect }: { expect: jest.Expect }) => {
  const { client, server } = useJsonRpcClient();
  expect(client).not.toBeNull();
  expect(server).not.toBeNull();
  return <div>Content</div>;
};

const TransactionConfirmComponent = ({ expect }: { expect: jest.Expect }) => {
  const { server } = useJsonRpcClient();
  server.onrequest({
    jsonrpc: '2.0',
    id: '1',
    method: ServerRpcMethods.Transaction,
    params: { details: 'some' },
  });
  return <div>Content</div>;
};

describe('JsonRpcProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore
    global.browser = {
      runtime: {
        connect: () => ({
          postMessage: () => {},
          onmessage: () => {},
          onMessage: {
            addListener: () => {},
          },
          onDisconnect: {
            addListener: (function_: any) => {},
          },
        }),
      },
    };
  });
  it('renders and provides client', () => {
    mockModalStore();
    mockConnectionStore();
    mockErrorStore();

    render(
      <JsonRPCProvider>
        <TestComponent expect={expect} />
      </JsonRPCProvider>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
  it('throws error if hook is called outside context', () => {
    mockModalStore();
    mockConnectionStore();
    mockErrorStore();
    silenceErrors();
    expect(() => render(<TestComponent expect={expect} />)).toThrow(
      'useJsonRpcClient must be used within JsonRPCProvider'
    );
  });
  it('handles connection notification messages', () => {
    mockModalStore();
    mockErrorStore();
    const { addConnection } = mockConnectionStore();
    const TestComponent = ({ expect }: { expect: jest.Expect }) => {
      const { client } = useJsonRpcClient();
      useEffect(() => {
        client.onmessage({
          jsonrpc: '2.0',
          method: RpcMethods.ConnectionsChange,
          params: {
            add: [
              {
                allowList: {
                  publicKeys: [],
                  wallets: ['Wallet 1'],
                },
                origin: 'https://vega.xyz',
              },
              {
                allowList: {
                  publicKeys: [],
                  wallets: ['Wallet 1'],
                },
                origin: 'https://vega.wxyz',
              },
            ],
          },
        });
      }, [client]);
      return <div>Content</div>;
    };

    render(
      <JsonRPCProvider>
        <TestComponent expect={expect} />
      </JsonRPCProvider>
    );
    expect(addConnection).toHaveBeenCalledTimes(2);
    expect(addConnection).toHaveBeenCalledWith({
      allowList: {
        publicKeys: [],
        wallets: ['Wallet 1'],
      },
      origin: 'https://vega.xyz',
    });
  });
  it('handles connection background interaction messages', () => {
    const { handleConnection } = mockModalStore();
    mockConnectionStore();
    mockErrorStore();
    const TestComponent = ({ expect }: { expect: jest.Expect }) => {
      const { server } = useJsonRpcClient();
      server.onrequest({
        jsonrpc: '2.0',
        id: '1',
        method: ServerRpcMethods.Connection,
        params: { details: 'some' },
      });
      return <div>Content</div>;
    };

    render(
      <JsonRPCProvider>
        <TestComponent expect={expect} />
      </JsonRPCProvider>
    );
    expect(handleConnection).toHaveBeenCalled();
  });
  it('handles transaction background interaction messages', () => {
    const { handleTransaction } = mockModalStore();
    mockErrorStore();
    mockConnectionStore();

    render(
      <JsonRPCProvider>
        <TransactionConfirmComponent expect={expect} />
      </JsonRPCProvider>
    );
    expect(handleTransaction).toHaveBeenCalled();
  });
  it('closes the window after an interaction if once is present in the URL', async () => {
    global.close = jest.fn();
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost/index.html?once=1',
      },
      writable: true, // possibility to override
    });
    mockModalStore();
    mockErrorStore();
    mockConnectionStore();

    render(
      <JsonRPCProvider>
        <TransactionConfirmComponent expect={expect} />
      </JsonRPCProvider>
    );
    await waitFor(() => expect(window.close).toHaveBeenCalled());
  });
  it('does not close the window after an interaction if once is present in the URL', async () => {
    global.close = jest.fn();
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost/index.html',
      },
      writable: true, // possibility to override
    });
    mockModalStore();
    mockErrorStore();
    mockConnectionStore();

    render(
      <JsonRPCProvider>
        <TransactionConfirmComponent expect={expect} />
      </JsonRPCProvider>
    );
    await waitFor(() => expect(window.close).toHaveBeenCalledTimes(0));
  });
  it('sets error message if a request fails when using the request methods', async () => {
    mockClient();
    mockModalStore();
    mockConnectionStore();
    const { setError } = mockErrorStore();

    const TestComponent = () => {
      const { request } = useJsonRpcClient();
      useEffect(() => {
        request('a.method.that.does.not.exist');
      }, [request]);
      return <div>Content</div>;
    };
    render(
      <JsonRPCProvider>
        <TestComponent />
      </JsonRPCProvider>
    );
    await waitFor(() => expect(setError).toHaveBeenCalledTimes(1));
    expect(setError).toHaveBeenCalledWith(new Error('Method not found'));
  });
  it('throws error message if a request fails when using the request methods and propagate is true', async () => {
    mockClient();
    mockModalStore();
    mockConnectionStore();
    const { setError } = mockErrorStore();

    let errorCaught = false;
    const TestComponent = ({ expect }: { expect: jest.Expect }) => {
      const { request } = useJsonRpcClient();
      useEffect(() => {
        // TODO there must be a better way to test this
        const run = async () => {
          const request_ = request('a.method.that.does.not.exist', null, true);
          await expect(request_).rejects.toThrow('Method not found');
          try {
            await request_;
          } catch {
            errorCaught = true;
          }
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [request]);
      return <div>Content</div>;
    };
    render(
      <JsonRPCProvider>
        <TestComponent expect={expect} />
      </JsonRPCProvider>
    );
    await waitFor(() => expect(errorCaught).toBe(true));
    expect(setError).toHaveBeenCalledTimes(0);
  });
});
