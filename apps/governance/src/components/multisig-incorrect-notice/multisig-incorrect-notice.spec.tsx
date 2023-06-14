import { render, screen } from '@testing-library/react';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { useEnvironment } from '@vegaprotocol/environment';
import { MultisigIncorrectNotice } from './multisig-incorrect-notice';

jest.mock('@vegaprotocol/web3', () => ({
  useEthereumConfig: jest.fn(),
}));

jest.mock('@vegaprotocol/environment', () => ({
  useEnvironment: jest.fn(),
}));

describe('MultisigIncorrectNotice', () => {
  it('renders correctly when config is provided', () => {
    (useEthereumConfig as jest.Mock).mockReturnValue({
      config: {
        multisig_control_contract: {
          address: '0x1234',
        },
      },
    });

    (useEnvironment as unknown as jest.Mock).mockReturnValue({
      ETHERSCAN_URL: 'https://etherscan.io',
    });

    render(<MultisigIncorrectNotice />);

    expect(screen.getByTestId('multisig-contract-link')).toHaveAttribute(
      'href',
      'https://etherscan.io/address/0x1234'
    );
    expect(screen.getByTestId('multisig-contract-link')).toHaveAttribute(
      'title',
      '0x1234'
    );
    expect(
      screen.getByTestId('multisig-validators-learn-more')
    ).toBeInTheDocument();
  });

  it('does not render when config is not provided', () => {
    (useEthereumConfig as jest.Mock).mockReturnValue({
      config: null,
    });

    const { container } = render(<MultisigIncorrectNotice />);

    expect(container.firstChild).toBeNull();
  });
});
