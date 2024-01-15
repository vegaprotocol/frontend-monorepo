import { act, fireEvent, render, screen } from '@testing-library/react';
import type { VegaWalletConfig } from '../provider';
import { VegaWalletProvider } from '../provider';
import { VegaConnectDialog, CLOSE_DELAY } from './connect-dialog';
import { useVegaWalletDialogStore } from './vega-wallet-dialog-store';
import type { VegaConnectDialogProps } from '..';
import {
  ClientErrors,
  InjectedConnector,
  JsonRpcConnector,
  ViewConnector,
  WalletError,
} from '../connectors';
import {
  mockBrowserWallet,
  clearBrowserWallet,
  delayedReject,
  delayedResolve,
} from '../test-helpers';

const mockUpdateDialogOpen = jest.fn();
const mockCloseVegaDialog = jest.fn();

let mockIsDesktopRunning = true;
const mockChainId = 'VEGA_CHAIN_ID';

jest.mock('../use-is-wallet-service-running', () => ({
  useIsWalletServiceRunning: jest
    .fn()
    .mockImplementation(() => mockIsDesktopRunning),
}));

let defaultProps: VegaConnectDialogProps;

const INITIAL_KEY = 'some-key';

const jsonRpc = new JsonRpcConnector();
const view = new ViewConnector(INITIAL_KEY);
const injected = new InjectedConnector();
const connectors = {
  jsonRpc,
  view,
  injected,
  snap: undefined,
};

beforeEach(() => {
  jest.clearAllMocks();
  defaultProps = {
    connectors,
  };

  useVegaWalletDialogStore.setState({
    updateVegaWalletDialog: mockUpdateDialogOpen,
    closeVegaWalletDialog: mockCloseVegaDialog,
    vegaWalletDialogOpen: true,
  });
});

const defaultConfig: VegaWalletConfig = {
  network: 'TESTNET',
  vegaUrl: 'https://vega.xyz',
  vegaWalletServiceUrl: 'https://vegaservice.xyz',
  links: {
    explorer: 'explorer-link',
    concepts: 'concepts-link',
    chromeExtensionUrl: 'chrome-link',
    mozillaExtensionUrl: 'mozilla-link',
  },
  chainId: 'VEGA_CHAIN_ID',
};

function generateJSX(
  props?: Partial<VegaConnectDialogProps>,
  config?: Partial<VegaWalletConfig>
) {
  return (
    <VegaWalletProvider config={{ ...defaultConfig, ...config }}>
      <VegaConnectDialog {...defaultProps} {...props} />
    </VegaWalletProvider>
  );
}

describe('VegaConnectDialog', () => {
  let navigatorGetter: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    navigatorGetter = jest.spyOn(window.navigator, 'userAgent', 'get');
  });
  it('displays a list of connection options', async () => {
    const { container, rerender } = render(generateJSX());
    expect(container).toBeEmptyDOMElement();
    rerender(generateJSX());
    const list = await screen.findByTestId('connectors-list');
    expect(list).toBeInTheDocument();
    expect(list.children).toHaveLength(2);
    expect(screen.getByTestId('connector-jsonRpc')).toHaveTextContent(
      'Use the Desktop App/CLI'
    );
  });

  it('displays browser wallet option if detected on window object', async () => {
    navigatorGetter.mockReturnValue('Chrome');
    mockBrowserWallet();
    render(generateJSX());
    const list = await screen.findByTestId('connectors-list');
    expect(list.children).toHaveLength(2);
    expect(screen.getByTestId('connector-injected')).toHaveTextContent(
      'Connect'
    );

    clearBrowserWallet();
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
        .mockImplementation(() => delayedResolve(true, delay));
      spyOnGetChainId = jest
        .spyOn(connectors.jsonRpc, 'getChainId')
        .mockImplementation(() =>
          delayedResolve({ chainID: mockChainId }, delay)
        );
      spyOnConnectWallet = jest
        .spyOn(connectors.jsonRpc, 'connectWallet')
        .mockImplementation(() => delayedResolve(null, delay));
      spyOnConnect = jest
        .spyOn(connectors.jsonRpc, 'connect')
        .mockImplementation(() =>
          delayedResolve([{ publicKey: 'pubkey', name: 'test key 1' }], delay)
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
            new WalletError(
              'User error',
              3001,
              'The user rejected the request'
            ),
            delay
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

    it('handles wallet running is not detected', async () => {
      mockIsDesktopRunning = false;
      render(generateJSX());
      expect(await screen.findByTestId('connector-jsonRpc')).toBeDisabled();
    });

    it('Mozilla logo should be rendered', async () => {
      navigatorGetter.mockReturnValue('Firefox');
      render(generateJSX());
      expect(await screen.findByTestId('mozilla-logo')).toBeInTheDocument();
    });

    it('Chrome logo should be rendered', async () => {
      navigatorGetter.mockReturnValue('Chrome');
      render(generateJSX());
      expect(await screen.findByTestId('chrome-logo')).toBeInTheDocument();
    });

    it('Chrome and Firefox logo should be rendered', async () => {
      navigatorGetter.mockReturnValue('Safari');
      render(generateJSX());
      expect(await screen.findByTestId('mozilla-logo')).toBeInTheDocument();
      expect(await screen.findByTestId('chrome-logo')).toBeInTheDocument();
    });
    async function selectJsonRpc() {
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      fireEvent.click(await screen.findByTestId('connector-jsonRpc'));
    }
  });

  describe('InjectedConnector', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
      localStorage.clear();
    });

    afterEach(() => {
      clearBrowserWallet();
    });

    it('connects', async () => {
      const delay = 100;
      const vegaWindow = {
        getChainId: jest.fn(() =>
          delayedResolve({ chainID: mockChainId }, delay)
        ),
        connectWallet: jest.fn(() => delayedResolve(null, delay)),
        disconnectWallet: jest.fn(() => delayedResolve(undefined, delay)),
        listKeys: jest.fn(() =>
          delayedResolve(
            {
              keys: [{ name: 'test key', publicKey: '0x123' }],
            },
            100
          )
        ),
      };
      mockBrowserWallet(vegaWindow);
      render(generateJSX());
      await selectInjected();

      // Await user connect
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
      expect(vegaWindow.connectWallet).toHaveBeenCalled();
      await act(async () => {
        jest.advanceTimersByTime(delay);
      });

      // Connect (list keys)
      expect(vegaWindow.listKeys).toHaveBeenCalled();
      await act(async () => {
        jest.advanceTimersByTime(delay);
      });
      expect(screen.getByText('Successfully connected')).toBeInTheDocument();

      await act(async () => {
        jest.advanceTimersByTime(CLOSE_DELAY);
      });
      expect(mockCloseVegaDialog).toHaveBeenCalledWith();
    });

    async function selectInjected() {
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      fireEvent.click(await screen.findByTestId('connector-injected'));
    }
  });
});
