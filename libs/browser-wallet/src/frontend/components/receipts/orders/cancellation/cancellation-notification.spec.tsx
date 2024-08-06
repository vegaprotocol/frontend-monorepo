import { render, screen } from '@testing-library/react';

import { useMarketsStore } from '@/stores/markets-store';
import { mockStore } from '@/test-helpers/mock-store';

import {
  CancellationNotification,
  locators,
} from './cancellation-notification';

jest.mock('@/stores/markets-store');

describe('CancellationNotification', () => {
  it('should display "Cancel all open orders in this market" when marketId is provided and orderId is not', () => {
    // If I cancel an order without an order id but with a market id I see a warning notifying me I will close all orders for that market (<a name="1117-ORDC-008" href="#1117-ORDC-008">1117-ORDC-008</a>)

    mockStore(useMarketsStore, {
      getMarketById: () => ({
        id: '1',
        tradableInstrument: {
          instrument: {
            code: 'BTC/USD',
          },
        },
      }),
    });
    render(<CancellationNotification orderId="" marketId="some-market-id" />);
    expect(
      screen.getByText('Cancel ALL open orders in BTC/USD')
    ).toBeInTheDocument();
  });

  it('should render nothing while loading the market name', () => {
    mockStore(useMarketsStore, {
      loading: true,
    });
    render(<CancellationNotification orderId="" marketId="some-market-id" />);
    expect(
      screen.getByTestId(locators.cancellationNotification)
    ).toBeEmptyDOMElement();
  });

  it('should display "Cancel all open orders in all markets" when neither orderId nor marketId is provided', () => {
    // If I cancel an order without an order id or market id I see a warning notifying me I will close all orders in all markets (<a name="1117-ORDC-009" href="#1117-ORDC-009">1117-ORDC-009</a>)
    mockStore(useMarketsStore, {
      getMarketById: () => ({
        id: '1',
        tradableInstrument: {
          instrument: {
            code: 'BTC/USD',
          },
        },
      }),
    });
    render(<CancellationNotification orderId="" marketId="" />);
    expect(
      screen.getByText('Cancel ALL orders in ALL markets')
    ).toBeInTheDocument();
  });

  it('should render market id if market code cannot be found', () => {
    mockStore(useMarketsStore, {
      getMarketById: () => ({
        id: '1',
      }),
    });
    render(<CancellationNotification orderId="" marketId="some-market-id" />);

    expect(
      screen.getByText('Cancel ALL open orders in some-m…t-id')
    ).toBeInTheDocument();
  });

  it('should render nothing order id is present', () => {
    // 1117-ORDC-006 If I cancel an order with an order id and no market id I see the [normal cancel order view](#enriched-order)
    // 1117-ORDC-007 If I cancel an order with an order id and a market id I see the [normal cancel order view](#enriched-order)
    mockStore(useMarketsStore, {
      getMarketById: () => ({
        id: '1',
      }),
    });
    {
      const { container } = render(
        <CancellationNotification orderId="id" marketId="some-market-id" />
      );

      expect(container).toBeEmptyDOMElement();
    }
    {
      const { container } = render(
        <CancellationNotification orderId="id" marketId="" />
      );

      expect(container).toBeEmptyDOMElement();
    }
  });

  it('should render nothing while loading', () => {
    mockStore(useMarketsStore, {
      getMarketById: () => {
        throw new Error('Error');
      },
      loading: true,
    });

    const { container } = render(
      <CancellationNotification orderId="id" marketId="some-market-id" />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
