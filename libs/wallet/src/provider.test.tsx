import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { VegaKey } from '@vegaprotocol/vegawallet-service-api-client';
import { RestConnector } from './connectors';
import { useVegaWallet } from './hooks';
import { VegaWalletProvider } from './provider';
import { WALLET_KEY } from './storage-keys';

const restConnector = new RestConnector();

afterAll(() => {
  localStorage.clear();
});

const TestComponent = () => {
  const { connect, disconnect, keypairs, keypair, selectPublicKey } =
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
      <p data-testid="current-keypair">{keypair?.pub}</p>
      {keypairs?.length ? (
        <ul data-testid="keypair-list">
          {keypairs.map((kp) => (
            <li key={kp.pub} onClick={() => selectPublicKey(kp.pub)}>
              {kp.pub}
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

test('Can connect, disconnect and retrieve keypairs', async () => {
  const mockKeypairs = [{ pub: 'public key 1' }, { pub: 'public key 2' }];
  jest
    .spyOn(restConnector, 'connect')
    .mockImplementation(() => Promise.resolve(mockKeypairs as VegaKey[]));

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
    mockKeypairs[0].pub
  );

  // Change current keypair
  fireEvent.click(screen.getByTestId('keypair-list').children[1]);
  expect(screen.getByTestId('current-keypair')).toHaveTextContent(
    mockKeypairs[1].pub
  );

  // Current keypair should persist
  unmount();
  render(generateJSX());
  await act(async () => {
    fireEvent.click(screen.getByText('Connect'));
  });
  expect(screen.getByTestId('current-keypair')).toHaveTextContent(
    mockKeypairs[1].pub
  );

  await act(async () => {
    fireEvent.click(screen.getByText('Disconnect'));
  });
  expect(screen.getByTestId('current-keypair')).toBeEmptyDOMElement();
  expect(screen.queryByTestId('keypairs-list')).not.toBeInTheDocument();
  expect(localStorage.getItem(WALLET_KEY)).toBe(null);
});
