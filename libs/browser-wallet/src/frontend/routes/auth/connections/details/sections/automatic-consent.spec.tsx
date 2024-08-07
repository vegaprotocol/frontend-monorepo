import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { locators as vegaSubHeaderLocators } from '@/components/sub-header';
import { useAsyncAction } from '@/hooks/async-action';
import { RpcMethods } from '@/lib/client-rpc-methods';
import { useConnectionStore } from '@/stores/connections';
import { mockStore } from '@/test-helpers/mock-store';
import { silenceErrors } from '@/test-helpers/silence-errors';

import { AutomaticConsentSection } from './automatic-consent';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';

jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: jest.fn().mockReturnValue({ request: jest.fn() }),
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
  return render(<AutomaticConsentSection connection={connection} />);
};

describe('AutomaticConsent', () => {
  it('renders title and checkbox', () => {
    mockStore(useConnectionStore, {
      loadConnections: jest.fn(),
    });
    (useAsyncAction as jest.Mock).mockImplementation((function_: any) => ({
      error: null,
      data: null,
      loading: false,
      loaderFunction: function_,
    }));
    renderComponent();
    expect(
      screen.getByTestId(vegaSubHeaderLocators.subHeader)
    ).toHaveTextContent('Automatic consent');
    expect(
      screen.getByLabelText(
        'Allow this site to automatically approve order and vote transactions.'
      )
    ).toBeVisible();
  });

  it('calls update connection and reloads connection data if checkbox is clicked', async () => {
    const loadConnections = jest.fn();
    mockStore(useConnectionStore, {
      loadConnections,
    });
    const { request } = useJsonRpcClient();
    // 1109-VCON-009 - I am able to toggle auto consent in the connection details screen
    (useAsyncAction as jest.Mock).mockImplementation((function_: any) => ({
      error: null,
      data: null,
      loading: false,
      loaderFunction: function_,
    }));
    renderComponent();
    fireEvent.click(
      screen.getByLabelText(
        'Allow this site to automatically approve order and vote transactions.'
      )
    );
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(RpcMethods.UpdateAutomaticConsent, {
        origin: 'https://foo.com',
        autoConsent: true,
      })
    );
    expect(loadConnections).toHaveBeenCalled();
  });

  it('throws error if there is an error', () => {
    mockStore(useConnectionStore, {
      loadConnections: jest.fn(),
    });
    silenceErrors();
    (useAsyncAction as jest.Mock).mockImplementation((function_: any) => ({
      error: new Error('Err'),
      data: null,
      loading: false,
      loaderFunction: function_,
    }));
    expect(() => renderComponent()).toThrow('Err');
  });
});
