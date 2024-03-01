import { render, screen } from '@testing-library/react';
import type { useWeb3React } from '@web3-react/core';
import Disassociate from './index';

jest.mock('../../../components/eth-connect-prompt', () => ({
  EthConnectPrompt: () => <div data-testid="eth-connect-prompt" />,
}));

jest.mock('./components/disassociate-page', () => ({
  DisassociatePage: () => <div data-testid="disassociate-page" />,
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

jest.mock('@vegaprotocol/wallet-react', () => ({
  ...jest.requireActual('@vegaprotocol/wallet-react'),
  useVegaWallet: jest.fn(() => mockVegaWalletHookValue),
}));

const renderComponent = () => {
  return render(<Disassociate name="Disassociate" />);
};

describe('Disassociate', () => {
  it('should render connect to eth button if not connected', () => {
    mockHookValue = defaultHookValue;
    renderComponent();
    expect(screen.getByTestId('eth-connect-prompt')).toBeInTheDocument();
  });

  it('should render disassociate page if eth wallet is connected and vega wallet is not', () => {
    mockHookValue = {
      ...defaultHookValue,
      account: 'foo',
    };
    renderComponent();
    expect(screen.queryByTestId('eth-connect-prompt')).toBeFalsy();
    expect(screen.getByTestId('disassociate-page')).toBeInTheDocument();
  });

  it('should render disassociate page if both wallets connected', () => {
    mockHookValue = {
      ...defaultHookValue,
      account: 'foo',
    };
    mockVegaWalletHookValue = { pubKey: 'foo' };
    renderComponent();
    expect(screen.getByTestId('disassociate-page')).toBeInTheDocument();
  });
});
