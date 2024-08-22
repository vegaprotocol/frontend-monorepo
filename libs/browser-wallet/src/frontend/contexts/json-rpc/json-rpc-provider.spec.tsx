import { render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';

import { ServerRpcMethods } from '@/lib/server-rpc-methods';
import { useErrorStore } from '@/stores/error';
import { useInteractionStore } from '@/stores/interaction-store';
import { mockClient } from '@/test-helpers/mock-client';
import { mockStore } from '@/test-helpers/mock-store';
import { silenceErrors } from '@/test-helpers/silence-errors';

import { useJsonRpcClient } from './json-rpc-context';
import { JsonRPCProvider } from './json-rpc-provider';

jest.mock('@/stores/interaction-store');
jest.mock('@/stores/error');

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
    mockErrorStore();
    silenceErrors();
    expect(() => render(<TestComponent expect={expect} />)).toThrow(
      'useJsonRpcClient must be used within JsonRPCProvider'
    );
  });
  it('handles transaction background interaction messages', () => {
    const { handleTransaction } = mockModalStore();
    mockErrorStore();

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
