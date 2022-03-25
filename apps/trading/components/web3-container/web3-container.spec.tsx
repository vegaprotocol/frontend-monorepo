import { fireEvent, render, screen } from '@testing-library/react';
import { Web3Container } from './web3-container';

const defaultHookValue = {
  isActive: false,
  error: undefined,
  connector: null,
  chainId: 3,
};
let mockHookValue;

jest.mock('@web3-react/core', () => {
  const original = jest.requireActual('@web3-react/core');
  return {
    ...original,
    useWeb3React: jest.fn(() => mockHookValue),
  };
});

test('Prompt to connect opens dialog', () => {
  mockHookValue = defaultHookValue;
  render(
    <Web3Container>
      <div>Child</div>
    </Web3Container>
  );

  expect(screen.queryByText('Child')).not.toBeInTheDocument();
  expect(screen.queryByTestId('web3-connector-list')).not.toBeInTheDocument();
  expect(screen.getByText('Connect your Ethereum wallet')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Connect'));
  expect(screen.getByTestId('web3-connector-list')).toBeInTheDocument();
});

test('Error message is shown', () => {
  const message = 'Opps! An error';
  mockHookValue = { ...defaultHookValue, error: new Error(message) };

  render(
    <Web3Container>
      <div>Child</div>
    </Web3Container>
  );

  expect(screen.queryByText('Child')).not.toBeInTheDocument();
  expect(screen.getByText(`Something went wrong: ${message}`));
});

test('Chain id matches app configuration', () => {
  const expectedChainId = 4;
  mockHookValue = {
    ...defaultHookValue,
    isActive: true,
    chainId: expectedChainId,
  };

  render(
    <Web3Container>
      <div>Child</div>
    </Web3Container>
  );

  expect(screen.queryByText('Child')).not.toBeInTheDocument();
  expect(screen.getByText(`This app only works on chain ID: 3`));
});
