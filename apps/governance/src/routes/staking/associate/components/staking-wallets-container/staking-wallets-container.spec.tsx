import { render, screen } from '@testing-library/react';
import type { useWeb3React } from '@web3-react/core';
import { StakingWalletsContainer } from './staking-wallets-container';

jest.mock('../../../../../components/connect-to-vega', () => ({
  ConnectToVega: () => <div data-testid="connect-to-vega" />,
}));

jest.mock('../../../../../components/eth-connect-prompt', () => ({
  EthConnectPrompt: () => <div data-testid="eth-connect-prompt" />,
}));

const defaultHookValue = {
  isActive: false,
  error: undefined,
  connector: null,
  chainId: 3,
  account: null,
} as unknown as ReturnType<typeof useWeb3React>;
let mockHookValue: ReturnType<typeof useWeb3React>;

jest.mock('@web3-react/core', () => {
  const original = jest.requireActual('@web3-react/core');
  return {
    ...original,
    useWeb3React: jest.fn(() => mockHookValue),
  };
});

let mockVegaWalletHookValue: {
  pubKey: string | null;
} = {
  pubKey: null,
};

jest.mock('@vegaprotocol/wallet', () => ({
  ...jest.requireActual('@vegaprotocol/wallet'),
  useVegaWallet: jest.fn(() => mockVegaWalletHookValue),
}));

const renderComponent = () => {
  return render(
    <StakingWalletsContainer>
      {({ address, pubKey }) => (
        <div>
          <div data-testid="eth-address">{address}</div>
          <div data-testid="vega-pubkey">{pubKey}</div>
        </div>
      )}
    </StakingWalletsContainer>
  );
};

describe('Staking wallets container', () => {
  it('should render connect to eth button if not connected', () => {
    mockHookValue = defaultHookValue;
    renderComponent();
    expect(screen.getByTestId('eth-connect-prompt')).toBeInTheDocument();
  });

  it('should render connect to vega button if there is no pubkey', () => {
    mockHookValue = {
      ...defaultHookValue,
      account: '0xb2d6DEC77558Cf8EdB7c428d23E70Eab0688544f',
    };
    renderComponent();
    expect(screen.getByTestId('connect-to-vega')).toBeInTheDocument();
  });

  it('should render children if both are connected', () => {
    mockVegaWalletHookValue = { pubKey: 'foo' };
    mockHookValue = {
      ...defaultHookValue,
      account: '0xb2d6DEC77558Cf8EdB7c428d23E70Eab0688544f',
    };
    renderComponent();
    expect(screen.getByTestId('eth-address')).toHaveTextContent(
      '0xb2d6DEC77558Cf8EdB7c428d23E70Eab0688544f'
    );
    expect(screen.getByTestId('vega-pubkey')).toHaveTextContent('foo');
  });
});
