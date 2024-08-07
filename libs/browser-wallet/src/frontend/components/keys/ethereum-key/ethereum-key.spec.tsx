import { render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { EthereumKey, locators } from '.';

jest.mock('../../copy-with-check', () => ({
  CopyWithCheckmark: () => <div data-testid="copy-with-checkmark" />,
}));

const address = '0x1234567890abcdef';

const renderComponent = () =>
  render(
    <MockNetworkProvider>
      <EthereumKey address={address} />
    </MockNetworkProvider>
  );

describe('EthereumKey', () => {
  it('renders Ethereum address correctly', () => {
    // 1115-EXPL-001 When I see the Ethereum key I can see a link to an Ethereum block explorer based on that address
    renderComponent();

    const explorerLink = screen.getByTestId(locators.explorerLink);
    expect(screen.getByTestId(locators.title)).toHaveTextContent(
      'Ethereum Address'
    );
    expect(explorerLink).toHaveAttribute(
      'href',
      `https://sepolia.etherscan.io/address/${address}`
    );
    expect(explorerLink).toHaveTextContent('0x1234…cdef');
  });

  it('renders the CopyWithCheckmark components', () => {
    renderComponent();
    expect(screen.getByTestId('copy-with-checkmark')).toBeInTheDocument();
  });
});
