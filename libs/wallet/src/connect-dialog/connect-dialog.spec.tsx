import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { VegaWalletProvider } from '../provider';
import { VegaConnectDialog, CLOSE_DELAY } from './connect-dialog';
import type { VegaWalletDialogStore } from './connect-dialog';
import type { VegaConnectDialogProps } from '..';
import {
  ClientErrors,
  JsonRpcConnector,
  RestConnector,
  ViewConnector,
  WalletError,
} from '../connectors';
import { useEnvironment } from '@vegaprotocol/environment';
import type { ChainIdQuery } from '@vegaprotocol/react-helpers';
import { ChainIdDocument } from '@vegaprotocol/react-helpers';

const mockUpdateDialogOpen = jest.fn();
const mockCloseVegaDialog = jest.fn();
const mockStoreObj: Partial<VegaWalletDialogStore> = {
  updateVegaWalletDialog: mockUpdateDialogOpen,
  closeVegaWalletDialog: mockCloseVegaDialog,
  vegaWalletDialogOpen: true,
};

jest.mock('@vegaprotocol/environment');

// @ts-ignore ignore mock implementation
useEnvironment.mockImplementation(() => ({
  VEGA_ENV: 'TESTNET',
  VEGA_URL: 'https://vega-node.url',
  VEGA_NETWORKS: JSON.stringify({}),
  VEGA_WALLET_URL: mockVegaWalletUrl,
  GIT_BRANCH: 'test',
  GIT_COMMIT_HASH: 'abcdef',
  GIT_ORIGIN_URL: 'https://github.com/test/repo',
  HOSTED_WALLET_URL: mockHostedWalletUrl,
}));

jest.mock('zustand', () => ({
  create: () => (storeGetter: (store: VegaWalletDialogStore) => unknown) =>
    storeGetter(mockStoreObj as VegaWalletDialogStore),
}));

let defaultProps: VegaConnectDialogProps;

const INITIAL_KEY = 'some-key';

const rest = new RestConnector();
const jsonRpc = new JsonRpcConnector();
const view = new ViewConnector(INITIAL_KEY);
const connectors = {
  rest,
  jsonRpc,
  view,
};
beforeEach(() => {
  jest.clearAllMocks();
  defaultProps = {
    connectors,
  };
});

const mockVegaWalletUrl = 'http://mock.wallet.com';
const mockHostedWalletUrl = 'http://mock.hosted.com';

const mockChainId = 'chain-id';

function generateJSX(props?: Partial<VegaConnectDialogProps>) {
  const chainIdMock: MockedResponse<ChainIdQuery> = {
    request: {
      query: ChainIdDocument,
    },
    result: {
      data: {
        statistics: {
          chainId: mockChainId,
        },
      },
    },
  };
  return (
    <MockedProvider mocks={[chainIdMock]}>
      <VegaWalletProvider>
        <VegaConnectDialog {...defaultProps} {...props} />
      </VegaWalletProvider>
    </MockedProvider>
  );
}

describe('VegaConnectDialog', () => {
  it('displays a list of connection options', async () => {
    const { container, rerender } = render(generateJSX());
    expect(container).toBeEmptyDOMElement();
    rerender(generateJSX());
    const list = await screen.findByTestId('connectors-list');
    expect(list).toBeInTheDocument();
    expect(list.children).toHaveLength(3);
    expect(screen.getByTestId('connector-jsonRpc')).toHaveTextContent(
      'Connect Vega wallet'
    );
    expect(screen.getByTestId('connector-hosted')).toHaveTextContent(
      'Hosted Fairground wallet'
    );
    expect(screen.getByTestId('connector-view')).toHaveTextContent(
      'View as vega user'
    );
  });

  describe('RestConnector', () => {
    it('connects', async () => {
      const spy = jest
        .spyOn(connectors.rest, 'authenticate')
        .mockImplementation(() =>
          Promise.resolve({ success: true, error: null })
        );

      render(generateJSX());
      // Switches to rest form
      fireEvent.click(await screen.findByText('Hosted Fairground wallet'));

      // Client side validation
      fireEvent.submit(screen.getByTestId('rest-connector-form'));
      expect(spy).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getAllByText('Required')).toHaveLength(2);
      });

      const fields = fillInForm();

      // Wait for auth method to be called
      await act(async () => {
        fireEvent.submit(screen.getByTestId('rest-connector-form'));
      });

      expect(spy).toHaveBeenCalledWith(fields);

      expect(mockCloseVegaDialog).toHaveBeenCalled();
    });

    it('handles failed connection', async () => {
      const errMessage = 'Error message';
      // Error from service
      let spy = jest
        .spyOn(connectors.rest, 'authenticate')
        .mockImplementation(() =>
          Promise.resolve({ success: false, error: errMessage })
        );

      render(generateJSX());
      // Switches to rest form
      fireEvent.click(await screen.findByText('Hosted Fairground wallet'));

      const fields = fillInForm();
      fireEvent.submit(screen.getByTestId('rest-connector-form'));

      // Wait for auth method to be called
      await act(async () => {
        fireEvent.submit(screen.getByTestId('rest-connector-form'));
      });

      expect(spy).toHaveBeenCalledWith(fields);

      expect(screen.getByTestId('form-error')).toHaveTextContent(errMessage);
      expect(mockUpdateDialogOpen).not.toHaveBeenCalled();

      // Fetch failed due to wallet not running
      spy = jest
        .spyOn(connectors.rest, 'authenticate')
        // @ts-ignore test fetch failed with typeerror
        .mockImplementation(() =>
          Promise.reject(new TypeError('fetch failed'))
        );

      await act(async () => {
        fireEvent.submit(screen.getByTestId('rest-connector-form'));
      });

      expect(screen.getByTestId('form-error')).toHaveTextContent(
        `Wallet not running at ${mockHostedWalletUrl}`
      );

      // Reject eg non 200 results
      spy = jest
        .spyOn(connectors.rest, 'authenticate')
        // @ts-ignore test fetch failed with typeerror
        .mockImplementation(() => Promise.reject(new Error('Error!')));

      await act(async () => {
        fireEvent.submit(screen.getByTestId('rest-connector-form'));
      });

      expect(screen.getByTestId('form-error')).toHaveTextContent(
        'Authentication failed'
      );
    });

    const fillInForm = () => {
      const walletValue = 'test-wallet';
      fireEvent.change(screen.getByTestId('rest-wallet'), {
        target: { value: walletValue },
      });
      const passphraseValue = 'test-passphrase';
      fireEvent.change(screen.getByTestId('rest-passphrase'), {
        target: { value: passphraseValue },
      });
      return { wallet: walletValue, passphrase: passphraseValue };
    };
  });

  describe('JsonRpcConnector', () => {
    const delay = 100;
    let spyOnCheckCompat: jest.SpyInstance;
    let spyOnGetChainId: jest.SpyInstance;
    let spyOnConnectWallet: jest.SpyInstance;
    let spyOnConnect: jest.SpyInstance;

    beforeEach(() => {
      spyOnCheckCompat = jest
        .spyOn(connectors.jsonRpc, 'checkCompat')
        .mockImplementation(() => delayedResolve(true));
      spyOnGetChainId = jest
        .spyOn(connectors.jsonRpc, 'getChainId')
        .mockImplementation(() => delayedResolve({ chainID: mockChainId }));
      spyOnConnectWallet = jest
        .spyOn(connectors.jsonRpc, 'connectWallet')
        .mockImplementation(() => delayedResolve(null));
      spyOnConnect = jest
        .spyOn(connectors.jsonRpc, 'connect')
        .mockImplementation(() =>
          delayedResolve([{ publicKey: 'pubkey', name: 'test key 1' }])
        );
    });

    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
      localStorage.clear();
    });

    it('connects with permission update', async () => {
      render(generateJSX());
      await selectJsonRpc();

      // Wallet version check
      expect(screen.getByText('Checking wallet version')).toBeInTheDocument();
      expect(spyOnCheckCompat).toHaveBeenCalled();
      await act(async () => {
        jest.advanceTimersByTime(delay);
      });

      // Chain check
      expect(screen.getByText('Verifying chain')).toBeInTheDocument();
      expect(spyOnGetChainId).toHaveBeenCalled();
      await act(async () => {
        jest.advanceTimersByTime(delay);
      });

      // Await user connect
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
      expect(spyOnConnectWallet).toHaveBeenCalled();
      await act(async () => {
        jest.advanceTimersByTime(delay);
      });

      // Connect (list keys)
      expect(spyOnConnect).toHaveBeenCalled();
      await act(async () => {
        jest.advanceTimersByTime(delay);
      });

      expect(screen.getByText('Successfully connected')).toBeInTheDocument();

      await act(async () => {
        jest.advanceTimersByTime(CLOSE_DELAY);
      });
      expect(mockCloseVegaDialog).toHaveBeenCalledWith();
    });

    it('handles incompatible wallet', async () => {
      spyOnCheckCompat
        .mockClear()
        .mockImplementation(() => delayedReject(ClientErrors.INVALID_WALLET));

      render(generateJSX());
      await selectJsonRpc();

      expect(screen.getByText('Checking wallet version')).toBeInTheDocument();
      await act(async () => {
        jest.advanceTimersByTime(delay);
      });
      expect(screen.getByText(/Wallet version invalid/i)).toBeInTheDocument();
    });

    it('handles user rejection', async () => {
      spyOnConnectWallet
        .mockClear()
        .mockImplementation(() =>
          delayedReject(
            new WalletError('User error', 3001, 'The user rejected the request')
          )
        );

      render(generateJSX());
      await selectJsonRpc();

      expect(spyOnCheckCompat).toHaveBeenCalled();
      expect(screen.getByText('Checking wallet version')).toBeInTheDocument();
      await act(async () => {
        jest.advanceTimersByTime(delay);
      });
      expect(spyOnGetChainId).toHaveBeenCalled();
      expect(screen.getByText('Verifying chain')).toBeInTheDocument();
      await act(async () => {
        jest.advanceTimersByTime(delay);
      });
      expect(spyOnConnectWallet).toHaveBeenCalled();
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
      await act(async () => {
        jest.advanceTimersByTime(delay);
      });
      expect(screen.getByText('User error')).toBeInTheDocument();
      expect(
        screen.getByText('The user rejected the request')
      ).toBeInTheDocument();
    });

    it('handles an unknown error', async () => {
      spyOnCheckCompat.mockClear().mockImplementation(() => {
        throw new Error('unknown error');
      });

      render(generateJSX());
      await selectJsonRpc();

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('An unknown error occurred')).toBeInTheDocument();
    });

    function delayedResolve<T>(result: T): Promise<T> {
      return new Promise((resolve) => {
        setTimeout(() => resolve(result), delay);
      });
    }

    function delayedReject<T>(result: T): Promise<T> {
      return new Promise((_, reject) => {
        setTimeout(() => reject(result), delay);
      });
    }

    async function selectJsonRpc() {
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      fireEvent.click(await screen.findByTestId('connector-jsonRpc'));
    }
  });

  describe('ViewOnlyConnector', () => {
    const fillInForm = (address = '0'.repeat(64)) => {
      fireEvent.change(screen.getByTestId('address'), {
        target: { value: address },
      });
      return { address };
    };

    it('connects', async () => {
      const spy = jest.spyOn(connectors.view, 'connect');

      render(generateJSX());
      // Switches to view form
      fireEvent.click(await screen.findByText('View as vega user'));

      // Client side validation
      fireEvent.submit(screen.getByTestId('view-connector-form'));
      expect(spy).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getAllByText('Required')).toHaveLength(1);
      });

      fillInForm();

      // Wait for auth method to be called
      await act(async () => {
        fireEvent.submit(screen.getByTestId('view-connector-form'));
      });

      expect(spy).toHaveBeenCalled();

      expect(mockCloseVegaDialog).toHaveBeenCalled();
    });

    it('ensures pubkey is of correct length', async () => {
      render(generateJSX());
      // Switches to view form
      fireEvent.click(await screen.findByText('View as vega user'));

      fillInForm('123');

      // Wait for auth method to be called
      await act(async () => {
        fireEvent.submit(screen.getByTestId('view-connector-form'));
      });
      await waitFor(() => {
        expect(
          screen.getAllByText('Pubkey must be 64 characters in length')
        ).toHaveLength(1);
      });
    });

    it('ensures pubkey is of valid hex', async () => {
      render(generateJSX());
      // Switches to view form
      fireEvent.click(await screen.findByText('View as vega user'));

      fillInForm('q'.repeat(64));

      // Wait for auth method to be called
      await act(async () => {
        fireEvent.submit(screen.getByTestId('view-connector-form'));
      });
      await waitFor(() => {
        expect(screen.getAllByText('Pubkey must be be valid hex')).toHaveLength(
          1
        );
      });
    });
  });
});
