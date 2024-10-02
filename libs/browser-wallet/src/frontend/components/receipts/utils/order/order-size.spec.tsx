import { render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
import { useMarketsStore } from '@/stores/markets-store';
import { mockStore } from '@/test-helpers/mock-store';

import { locators as amountWithSymbolLocators } from '../string-amounts/amount-with-symbol';
import { locators as sizeWithTooltipLocators } from '../string-amounts/size-with-tooltip';
import { OrderSize } from './order-size';
import { TooltipProvider } from '@vegaprotocol/ui-toolkit';

jest.mock('@/stores/markets-store');

const renderComponent = ({
  size,
  marketId,
}: {
  size: string;
  marketId: string;
}) =>
  render(
    <MockNetworkProvider>
      <TooltipProvider>
        <OrderSize size={size} marketId={marketId} />
      </TooltipProvider>
    </MockNetworkProvider>
  );

describe('OrderSizeComponent', () => {
  it('should return basic data if markets are loading or formattedSize or symbol is not defined', () => {
    mockStore(useMarketsStore, { loading: true });
    renderComponent({ size: '100', marketId: 'someMarketId' });
    expect(
      screen.getByTestId(sizeWithTooltipLocators.sizeWithTooltip)
    ).toBeInTheDocument();
  });

  it('should return enriched data otherwise', () => {
    // 1130-ODTB-012 I see the order size in the enriched data view when data has been loaded successfully
    mockStore(useMarketsStore, {
      getMarketById: () => ({
        positionDecimalPlaces: 2,
      }),
    });
    renderComponent({ size: '100', marketId: 'someMarketId' });

    expect(
      screen.getByTestId(amountWithSymbolLocators.amountWithSymbol)
    ).toBeInTheDocument();
  });
});
