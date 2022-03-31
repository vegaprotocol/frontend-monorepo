import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { VegaWalletContextShape } from './context';
import { VegaWalletContext } from './context';
import { VegaConnectDialog } from './connect-dialog';
import type { VegaConnectDialogProps } from '.';
import { RestConnector } from './connectors';

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
    keypair: null,
    keypairs: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
    selectPublicKey: jest.fn(),
    connector: null,
    sendTx: jest.fn(),
  };
});

function generateJSX(
  props?: Partial<VegaConnectDialogProps>,
  contextValue?: Partial<VegaWalletContextShape>
) {
  return (
    <VegaWalletContext.Provider
      value={{ ...defaultContextValue, ...contextValue }}
    >
      <VegaConnectDialog {...defaultProps} {...props} />
    </VegaWalletContext.Provider>
  );
}

test('Renders list of connectors', () => {
  const { container, rerender } = render(generateJSX());
  expect(container).toBeEmptyDOMElement();
  rerender(generateJSX({ dialogOpen: true }));
  const list = screen.getByTestId('connectors-list');
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

test('Successful connection using rest auth form', async () => {
  const spy = jest
    .spyOn(defaultProps.connectors['rest'] as RestConnector, 'authenticate')
    .mockImplementation(() => Promise.resolve({ success: true, error: null }));

  render(generateJSX({ dialogOpen: true }));
  // Switches to rest form
  fireEvent.click(screen.getByText('rest provider'));

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

  expect(defaultProps.setDialogOpen).toHaveBeenCalledWith(false);
});

test('Unsuccessful connection using rest auth form', async () => {
  // Error from service
  let spy = jest
    .spyOn(defaultProps.connectors['rest'] as RestConnector, 'authenticate')
    .mockImplementation(() =>
      Promise.resolve({ success: false, error: 'Error message' })
    );

  render(generateJSX({ dialogOpen: true }));
  // Switches to rest form
  fireEvent.click(screen.getByText('rest provider'));

  const fields = fillInForm();
  fireEvent.submit(screen.getByTestId('rest-connector-form'));

  // Wait for auth method to be called
  await act(async () => {
    fireEvent.submit(screen.getByTestId('rest-connector-form'));
  });

  expect(spy).toHaveBeenCalledWith(fields);

  expect(screen.getByTestId('form-error')).toHaveTextContent(
    'Something went wrong'
  );
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
    'Wallet not running at http://localhost:1789'
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
