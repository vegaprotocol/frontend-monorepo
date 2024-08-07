import { fireEvent, render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { locators as decimalTooltipLocators } from './decimal-tooltip';
import { locators, PriceWithTooltip } from './price-with-tooltip';

const renderComponent = ({
  marketId,
  price,
}: {
  marketId: string;
  price: string;
}) =>
  render(
    <MockNetworkProvider>
      <PriceWithTooltip marketId={marketId} price={price} />
    </MockNetworkProvider>
  );

describe('PriceWithTooltip', () => {
  it('renders the amount', () => {
    const marketId = 'your-market-id';
    const amount = '100';
    renderComponent({
      marketId,
      price: amount,
    });
    const amountElement = screen.getByTestId(locators.price);
    expect(amountElement).toBeInTheDocument();
    expect(amountElement).toHaveTextContent(amount);
  });

  it('renders the tooltip asset explorer link and docs links', async () => {
    const marketId = 'your-market-id';
    const amount = '100';
    renderComponent({
      marketId,
      price: amount,
    });
    fireEvent.pointerMove(screen.getByTestId(locators.price));
    const [tooltip] = await screen.findAllByTestId(
      decimalTooltipLocators.decimalTooltip
    );
    expect(tooltip).toBeInTheDocument();
  });
});
