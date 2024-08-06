import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useAsyncAction } from '@/hooks/async-action';
import { useConnectionStore } from '@/stores/connections';
import { mockStore } from '@/test-helpers/mock-store';
import { silenceErrors } from '@/test-helpers/silence-errors';

import { DeleteConnectionSection, locators } from './delete-connection';

const request = jest.fn();
jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: () => ({ request }),
}));
jest.mock('@/hooks/async-action');
jest.mock('@/stores/connections');

const renderComponent = () => {
  const connection = {
    origin: 'https://foo.com',
    accessedAt: 0,
    chainId: 'chainId',
    networkId: 'networkId',
    allowList: {
      publicKeys: [],
      wallets: [],
    },
    autoConsent: false,
  };
  return render(
    <MemoryRouter>
      <DeleteConnectionSection connection={connection} />
    </MemoryRouter>
  );
};

describe('DeleteConnectionSection', () => {
  it('allows removing of connection', async () => {
    (useAsyncAction as jest.Mock).mockImplementation((function_: any) => ({
      error: null,
      data: null,
      loading: false,
      loaderFunction: function_,
    }));
    const removeConnection = jest.fn();
    const connection = {
      origin: 'https://foo.com',
      accessedAt: 0,
      chainId: 'chainId',
      networkId: 'networkId',
      allowList: {
        publicKeys: [],
        wallets: [],
      },
      autoConsent: false,
    };
    mockStore(useConnectionStore, {
      loading: false,
      removeConnection,
    });
    renderComponent();
    const removeButton = screen.getByTestId(locators.removeConnection);
    fireEvent.click(removeButton);
    await waitFor(() =>
      expect(removeConnection).toHaveBeenCalledWith(request, connection)
    );
  });
  it('throws error if error from remove connection', async () => {
    silenceErrors();
    (useAsyncAction as jest.Mock).mockImplementation((function_: any) => ({
      error: new Error('Err'),
      data: null,
      loading: false,
      loaderFunction: function_,
    }));
    mockStore(useConnectionStore, {
      loading: false,
      removeConnection: jest.fn(),
    });
    expect(() => renderComponent()).toThrow('Err');
  });
  it('returns null while loading', () => {
    (useAsyncAction as jest.Mock).mockImplementation((function_: any) => ({
      error: null,
      data: null,
      loading: false,
      loaderFunction: function_,
    }));

    mockStore(useConnectionStore, { loading: true });
    const { container } = renderComponent();
    expect(container).toBeEmptyDOMElement();
  });
});
