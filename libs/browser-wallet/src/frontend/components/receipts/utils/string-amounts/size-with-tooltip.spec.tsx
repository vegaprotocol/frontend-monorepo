import { fireEvent, render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { locators as decimalTooltipLocators } from './decimal-tooltip';
import { locators, SizeWithTooltip } from './size-with-tooltip';

const renderComponent = ({
  marketId,
  size,
}: {
  marketId: string;
  size: string;
}) =>
  render(
    <MockNetworkProvider>
      <SizeWithTooltip marketId={marketId} size={size} />
    </MockNetworkProvider>
  );

describe('SizeWithTooltip', () => {
  it('renders the amount', () => {
    const marketId = 'your-market-id';
    const amount = '100';
    renderComponent({
      marketId,
      size: amount,
    });
    const amountElement = screen.getByTestId(locators.size);
    expect(amountElement).toBeInTheDocument();
    expect(amountElement).toHaveTextContent(amount);
  });

  it('renders the tooltip asset explorer link and docs links', async () => {
    const marketId = 'your-market-id';
    const amount = '100';
    renderComponent({
      marketId,
      size: amount,
    });
    fireEvent.pointerMove(screen.getByTestId(locators.size));
    await screen.findAllByTestId(decimalTooltipLocators.decimalTooltip);
    expect(
      screen.getByTestId(decimalTooltipLocators.decimalTooltip)
    ).toBeInTheDocument();
  });
});
