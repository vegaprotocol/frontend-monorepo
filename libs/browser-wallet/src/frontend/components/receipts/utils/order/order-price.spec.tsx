import { render, screen } from '@testing-library/react';
import { OrderType } from '@vegaprotocol/enums';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
import { type AssetsStore, useAssetsStore } from '@/stores/assets-store';
import { type MarketsStore, useMarketsStore } from '@/stores/markets-store';
import { type DeepPartial, mockStore } from '@/test-helpers/mock-store';

import { locators as amountWithSymbolLocators } from '../string-amounts/amount-with-symbol';
import { locators as priceWithTooltipLocators } from '../string-amounts/price-with-tooltip';
import { locators as orderPriceLocators, OrderPrice } from './order-price';
import { TooltipProvider } from '@vegaprotocol/ui-toolkit';

jest.mock('@/stores/assets-store');
jest.mock('@/stores/markets-store');

const mockStores = (
  marketStore: DeepPartial<MarketsStore>,
  assetStore: DeepPartial<AssetsStore>
) => {
  mockStore(useMarketsStore, marketStore);
  mockStore(useAssetsStore, assetStore);
};

const MARKET_MOCK = {
  tradableInstrument: {
    instrument: { future: { settlementAsset: 'someAssetId' } },
  },
  decimalPlaces: 2,
};

const ASSET_MOCK = {
  details: { symbol: 'SYM' },
};

const renderComponent = ({
  price,
  marketId,
  type,
}: {
  price: string;
  marketId: string;
  type?: OrderType;
}) => {
  render(
    <MockNetworkProvider>
      <TooltipProvider>
        <OrderPrice price={price} marketId={marketId} type={type} />
      </TooltipProvider>
    </MockNetworkProvider>
  );
};

describe('OrderPriceComponent', () => {
  it('should return "Market price" if tx is of market type', () => {
    mockStores(
      {
        getMarketById: () => MARKET_MOCK,
      },
      {
        getAssetById: () => ASSET_MOCK,
      }
    );
    // 1130-ODTB-010 I can see 'Market price'
    renderComponent({
      price: '0',
      marketId: 'someMarketId',
      type: OrderType.TYPE_MARKET,
    });
    expect(
      screen.getByTestId(orderPriceLocators.orderDetailsMarketPrice).textContent
    ).toBe('Market price');
  });

  it('should return basic price tooltip if formatted amount is undefined', () => {
    // Simulate loading the market
    mockStores(
      {
        loading: true,
        getMarketById: () => MARKET_MOCK,
      },
      {
        getAssetById: () => ASSET_MOCK,
      }
    );
    renderComponent({ price: '0', marketId: 'someMarketId' });
    expect(
      screen.getByTestId(priceWithTooltipLocators.priceWithTooltip)
    ).toBeInTheDocument();
  });

  it('should return enriched data otherwise', () => {
    mockStores(
      {
        getMarketById: () => MARKET_MOCK,
      },
      {
        getAssetById: () => ASSET_MOCK,
      }
    );
    // 1130-ODTB-013 I see the order price in the enriched data view when data has been loaded successfully
    renderComponent({ price: '10', marketId: 'someMarketId' });

    expect(
      screen.getByTestId(amountWithSymbolLocators.amountWithSymbol)
    ).toBeInTheDocument();
  });
});
