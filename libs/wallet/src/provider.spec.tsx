import { act, fireEvent, render, screen } from '@testing-library/react';
import { RestConnector } from './connectors';
import { useVegaWallet } from './use-vega-wallet';
import { VegaWalletProvider } from './provider';
import { WALLET_KEY } from './storage';

const restConnector = new RestConnector();

afterAll(() => {
  localStorage.clear();
});

const TestComponent = () => {
  const { connect, disconnect, pubKey, pubKeys, selectPublicKey } =
    useVegaWallet();
  return (
    <div data-testid="children">
      <button
        onClick={() => {
          connect(restConnector);
        }}
      >
        Connect
      </button>
      <button
        onClick={() => {
          disconnect();
        }}
      >
        Disconnect
      </button>
      <p data-testid="current-keypair">{pubKey}</p>
      {pubKeys?.length ? (
        <ul data-testid="keypair-list">
          {pubKeys.map((pk) => (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
            <li key={pk} onClick={() => selectPublicKey(pk)}>
              {pk}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

const generateJSX = () => (
  <VegaWalletProvider>
    <TestComponent />
  </VegaWalletProvider>
);

it('Can connect, disconnect and retrieve keypairs', async () => {
  const mockKeypairs = ['public key 1', 'public key 2'];
  jest
    .spyOn(restConnector, 'connect')
    .mockImplementation(() => Promise.resolve(mockKeypairs));

  jest
    .spyOn(restConnector, 'disconnect')
    .mockImplementation(() => Promise.resolve());

  const { unmount } = render(generateJSX());
  expect(screen.getByTestId('children')).toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByText('Connect'));
  });
  expect(screen.getByTestId('keypair-list').children).toHaveLength(
    mockKeypairs.length
  );
  expect(screen.getByTestId('current-keypair')).toHaveTextContent(
    mockKeypairs[0]
  );

  // Change current keypair
  fireEvent.click(screen.getByTestId('keypair-list').children[1]);
  expect(screen.getByTestId('current-keypair')).toHaveTextContent(
    mockKeypairs[1]
  );

  // Current keypair should persist
  unmount();
  render(generateJSX());
  await act(async () => {
    fireEvent.click(screen.getByText('Connect'));
  });
  expect(screen.getByTestId('current-keypair')).toHaveTextContent(
    mockKeypairs[1]
  );

  await act(async () => {
    fireEvent.click(screen.getByText('Disconnect'));
  });
  expect(screen.getByTestId('current-keypair')).toBeEmptyDOMElement();
  expect(screen.queryByTestId('keypairs-list')).not.toBeInTheDocument();
  expect(localStorage.getItem(WALLET_KEY)).toBe(null);
});
