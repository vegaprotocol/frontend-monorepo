import { fireEvent, render, screen } from '@testing-library/react';
import { Web3Container } from './web3-container';

const props = {
  setDialogOpen: jest.fn(),
  appChainId: 1,
};

const defaultWeb3State = {
  isActive: false,
  error: undefined,
  connector: {
    connectEagerly: jest.fn(),
    activate: jest.fn(),
  },
  chainId: 3,
};

// eslint-disable-next-line
let mockWeb3State: any = defaultWeb3State;

jest.mock('@web3-react/core', () => ({
  useWeb3React: jest.fn(() => mockWeb3State),
}));

test('Prompts to connect', () => {
  render(
    <Web3Container {...props}>
      <div>Child</div>
    </Web3Container>
  );

  expect(screen.queryByText('Child')).not.toBeInTheDocument();
  expect(screen.getByText('Connect your Ethereum wallet')).toBeInTheDocument();
  const connectButton = screen.getByRole('button');
  expect(connectButton).toHaveTextContent('Connect');
  fireEvent.click(connectButton);
  expect(props.setDialogOpen).toHaveBeenCalledWith(true);
});

test('Shows error message', () => {
  const errMsg = 'Opps! An Error';
  mockWeb3State = {
    ...defaultWeb3State,
    error: new Error(errMsg),
  };
  render(
    <Web3Container {...props}>
      <div>Child</div>
    </Web3Container>
  );

  expect(screen.queryByText('Child')).not.toBeInTheDocument();
  expect(
    screen.getByText(`Something went wrong: ${errMsg}`)
  ).toBeInTheDocument();
});

test('Handles being on the wrong chain', () => {
  mockWeb3State = {
    ...defaultWeb3State,
    isActive: true,
    chainId: 3,
  };
  render(
    <Web3Container {...props}>
      <div>Child</div>
    </Web3Container>
  );

  expect(screen.queryByText('Child')).not.toBeInTheDocument();
  expect(
    screen.getByText(/This app only works on chain ID:/)
  ).toBeInTheDocument();
});

test('Renders children if properly connected', () => {
  mockWeb3State = {
    ...defaultWeb3State,
    isActive: true,
    chainId: 1,
  };
  render(
    <Web3Container {...props}>
      <div>Child</div>
    </Web3Container>
  );

  expect(screen.getByText('Child')).toBeInTheDocument();
});
