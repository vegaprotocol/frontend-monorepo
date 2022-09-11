import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { VegaWalletContextShape } from '../context';
import { VegaWalletContext } from '../context';
import { HOSTED_WALLET_URL, VegaConnectDialog } from './connect-dialog';
import type { VegaConnectDialogProps } from '..';
import { RestConnector } from '../connectors';
import { EnvironmentProvider } from '@vegaprotocol/environment';
import type { ChainIdQuery } from '@vegaprotocol/react-helpers';
import { ChainIdDocument } from '@vegaprotocol/react-helpers';

let defaultProps: VegaConnectDialogProps;
let defaultContextValue: VegaWalletContextShape;

beforeEach(() => {
  defaultProps = {
    connectors: {
      rest: new RestConnector(),
    },
    dialogOpen: false,
    setDialogOpen: jest.fn(),
  };
  defaultContextValue = {
    pubKey: null,
    pubKeys: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
    selectPubKey: jest.fn(),
    sendTx: jest.fn(),
  };
});

const mockEnvironment = {
  VEGA_ENV: 'TESTNET',
  VEGA_URL: 'https://vega-node.url',
  VEGA_NETWORKS: JSON.stringify({}),
  GIT_BRANCH: 'test',
  GIT_COMMIT_HASH: 'abcdef',
  GIT_ORIGIN_URL: 'https://github.com/test/repo',
};

const mockChainId = 'chain-id';

function generateJSX(
  props?: Partial<VegaConnectDialogProps>,
  contextValue?: Partial<VegaWalletContextShape>
) {
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
        <VegaWalletContext.Provider
          value={{ ...defaultContextValue, ...contextValue }}
        >
          <VegaConnectDialog {...defaultProps} {...props} />
        </VegaWalletContext.Provider>
      </MockedProvider>
    </EnvironmentProvider>
  );
}

describe('VegaConnectDialog', () => {
  it('Renders list of connectors', async () => {
    const { container, rerender } = render(generateJSX());
    expect(container).toBeEmptyDOMElement();
    rerender(generateJSX({ dialogOpen: true }));
    const list = await screen.findByTestId('connectors-list');
    expect(list).toBeInTheDocument();
    expect(list.children).toHaveLength(
      Object.keys(defaultProps.connectors).length
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

  it('Successful connection using rest auth form', async () => {
    const spy = jest
      .spyOn(defaultProps.connectors['rest'] as RestConnector, 'authenticate')
      .mockImplementation(() =>
        Promise.resolve({ success: true, error: null })
      );

    render(generateJSX({ dialogOpen: true }));
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

  it('Unsuccessful connection using rest auth form', async () => {
    const errMessage = 'Error message';
    // Error from service
    let spy = jest
      .spyOn(defaultProps.connectors['rest'] as RestConnector, 'authenticate')
      .mockImplementation(() =>
        Promise.resolve({ success: false, error: errMessage })
      );

    render(generateJSX({ dialogOpen: true }));
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
      .mockImplementation(() => Promise.reject(new TypeError('fetch failed')));

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
});
