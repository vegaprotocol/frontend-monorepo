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
import { HOSTED_WALLET_URL, VegaConnectDialog } from './connect-dialog';
import type { VegaConnectDialogProps } from '..';
import { JsonRpcConnector, RestConnector, WalletError } from '../connectors';
import { Errors } from '../connectors/json-rpc-connector';
import { EnvironmentProvider } from '@vegaprotocol/environment';
import type { ChainIdQuery } from '@vegaprotocol/react-helpers';
import { ChainIdDocument } from '@vegaprotocol/react-helpers';

let defaultProps: VegaConnectDialogProps;

beforeEach(() => {
  defaultProps = {
    connectors: {
      rest: new RestConnector(),
      jsonRpc: new JsonRpcConnector(),
    },
    dialogOpen: true,
    setDialogOpen: jest.fn(),
  };
});

const mockVegaWalletUrl = 'http://mock.wallet.com';
const mockEnvironment = {
  VEGA_ENV: 'TESTNET',
  VEGA_URL: 'https://vega-node.url',
  VEGA_NETWORKS: JSON.stringify({}),
  VEGA_WALLET_URL: mockVegaWalletUrl,
  GIT_BRANCH: 'test',
  GIT_COMMIT_HASH: 'abcdef',
  GIT_ORIGIN_URL: 'https://github.com/test/repo',
};

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
    <EnvironmentProvider definitions={mockEnvironment}>
      <MockedProvider mocks={[chainIdMock]}>
        <VegaWalletProvider>
          <VegaConnectDialog {...defaultProps} {...props} />
        </VegaWalletProvider>
      </MockedProvider>
    </EnvironmentProvider>
  );
}

describe('VegaConnectDialog', () => {
  it('displays a list of connection options', async () => {
    const { container, rerender } = render(generateJSX());
    expect(container).toBeEmptyDOMElement();
    rerender(generateJSX());
    const list = await screen.findByTestId('connectors-list');
    expect(list).toBeInTheDocument();
    expect(list.children).toHaveLength(
      Object.keys(defaultProps.connectors).length
    );
    expect(screen.getByTestId('connector-jsonRpc')).toHaveTextContent(
      /vega wallet/i
    );
    expect(screen.getByTestId('connector-rest')).toHaveTextContent(
      /hosted wallet/i
    );
  });

  describe('RestConnector', () => {
    it('connects', async () => {
      const spy = jest
        .spyOn(defaultProps.connectors['rest'] as RestConnector, 'authenticate')
        .mockImplementation(() =>
          Promise.resolve({ success: true, error: null })
        );

      render(generateJSX());
      // Switches to rest form
      fireEvent.click(await screen.findByText('Hosted wallet'));

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

      expect(spy).toHaveBeenCalledWith(HOSTED_WALLET_URL, fields);

      expect(defaultProps.setDialogOpen).toHaveBeenCalledWith(false);
    });

    it('handles failed connection', async () => {
      const errMessage = 'Error message';
      // Error from service
      let spy = jest
        .spyOn(defaultProps.connectors['rest'] as RestConnector, 'authenticate')
        .mockImplementation(() =>
          Promise.resolve({ success: false, error: errMessage })
        );

      render(generateJSX());
      // Switches to rest form
      fireEvent.click(await screen.findByText('Hosted wallet'));

      const fields = fillInForm();
      fireEvent.submit(screen.getByTestId('rest-connector-form'));

      // Wait for auth method to be called
      await act(async () => {
        fireEvent.submit(screen.getByTestId('rest-connector-form'));
      });

      expect(spy).toHaveBeenCalledWith(HOSTED_WALLET_URL, fields);

      expect(screen.getByTestId('form-error')).toHaveTextContent(errMessage);
      expect(defaultProps.setDialogOpen).not.toHaveBeenCalled();

      // Fetch failed due to wallet not running
      spy = jest
        .spyOn(defaultProps.connectors['rest'] as RestConnector, 'authenticate')
        // @ts-ignore test fetch failed with typeerror
        .mockImplementation(() =>
          Promise.reject(new TypeError('fetch failed'))
        );

      await act(async () => {
        fireEvent.submit(screen.getByTestId('rest-connector-form'));
      });

      expect(screen.getByTestId('form-error')).toHaveTextContent(
        `Wallet not running at ${HOSTED_WALLET_URL}`
      );

      // Reject eg non 200 results
      spy = jest
        .spyOn(defaultProps.connectors['rest'] as RestConnector, 'authenticate')
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
      fireEvent.change(screen.getByLabelText('Wallet'), {
        target: { value: walletValue },
      });
      const passphraseValue = 'test-passphrase';
      fireEvent.change(screen.getByLabelText('Passphrase'), {
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
    let spyOnGetPermissions: jest.SpyInstance;
    let spyOnRequestPermissions: jest.SpyInstance;

    beforeEach(() => {
      const connector = defaultProps.connectors.jsonRpc as JsonRpcConnector;

      spyOnCheckCompat = jest
        .spyOn(connector, 'checkCompat')
        .mockImplementation(() => delayedResolve(true));
      spyOnGetChainId = jest
        .spyOn(connector, 'getChainId')
        .mockImplementation(() => delayedResolve({ chainID: mockChainId }));
      spyOnConnectWallet = jest
        .spyOn(connector, 'connectWallet')
        .mockImplementation(() => delayedResolve({ token: 'token' }));
      spyOnGetPermissions = jest
        .spyOn(connector, 'getPermissions')
        .mockImplementation(() =>
          delayedResolve({
            permissions: {
              public_keys: 'none',
            },
          })
        );
      spyOnRequestPermissions = jest
        .spyOn(connector, 'requestPermissions')
        .mockImplementation(() =>
          delayedResolve({
            permissions: {
              public_keys: 'read',
            },
          })
        );
      spyOnConnect = jest
        .spyOn(connector, 'connect')
        .mockImplementation(() => delayedResolve(['pubkey']));
    });

    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
      localStorage.clear();
    });

    it('connects with permission update', async () => {
      const mockSetDialog = jest.fn();

      render(generateJSX({ setDialogOpen: mockSetDialog }));
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

      // Perms check
      expect(spyOnGetPermissions).toHaveBeenCalled();
      await act(async () => {
        jest.advanceTimersByTime(delay);
      });

      // Await user perms update
      expect(screen.getByText('Update permissions')).toBeInTheDocument();
      expect(spyOnRequestPermissions).toHaveBeenCalled();
      await act(async () => {
        jest.advanceTimersByTime(delay);
      });

      // Connect (list keys)
      expect(spyOnConnect).toHaveBeenCalled();
      await act(async () => {
        jest.advanceTimersByTime(delay);
      });
      expect(mockSetDialog).toHaveBeenCalledWith(false);
    });

    it('handles incompatible wallet', async () => {
      spyOnCheckCompat
        .mockClear()
        .mockImplementation(() => delayedReject(Errors.INVALID_WALLET));

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
          delayedReject(new WalletError('message', 3001, 'data'))
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
      expect(screen.getByText('Connection declined')).toBeInTheDocument();
      expect(
        screen.getByText('Your wallet connection was rejected')
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
});
