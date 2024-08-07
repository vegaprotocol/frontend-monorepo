import { render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { ArbitrumKey, locators } from '.';

jest.mock('../../copy-with-check', () => ({
  CopyWithCheckmark: () => <div data-testid="copy-with-checkmark" />,
}));

const address = '0x1234567890abcdef';

const renderComponent = () =>
  render(
    <MockNetworkProvider>
      <ArbitrumKey address={address} />
    </MockNetworkProvider>
  );

describe('ArbitrumKey', () => {
  it('renders Arbitrum address correctly', () => {
    renderComponent();

    const explorerLink = screen.getByTestId(locators.explorerLink);
    expect(screen.getByTestId(locators.title)).toHaveTextContent(
      'Arbitrum Address'
    );
    expect(explorerLink).toHaveAttribute(
      'href',
      `https://sepolia.arbiscan.io/address/${address}`
    );
    expect(explorerLink).toHaveTextContent('0x1234…cdef');
  });

  it('renders the CopyWithCheckmark components', () => {
    renderComponent();
    expect(screen.getByTestId('copy-with-checkmark')).toBeInTheDocument();
  });
});
