import { VegaWalletContext } from '@vegaprotocol/wallet';
import { addDecimal } from '@vegaprotocol/react-helpers';
import { fireEvent, render, screen, act } from '@testing-library/react';
import { DealTicket } from './deal-ticket';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';
import {
  MarketState,
  MarketTradingMode,
  OrderTimeInForce,
  OrderType,
} from '@vegaprotocol/types';
import type { Order } from '@vegaprotocol/orders';

const market: DealTicketQuery_market = {
  __typename: 'Market',
  id: 'market-id',
  name: 'market-name',
  decimalPlaces: 2,
  positionDecimalPlaces: 1,
  tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
  state: MarketState.STATE_ACTIVE,
  tradableInstrument: {
    __typename: 'TradableInstrument',
    instrument: {
      __typename: 'Instrument',
      product: {
        __typename: 'Future',
        quoteName: 'quote-name',
        settlementAsset: {
          __typename: 'Asset',
          id: 'asset-id',
          name: 'asset-name',
          symbol: 'asset-symbol',
        },
      },
    },
  },
  depth: {
    __typename: 'MarketDepth',
    lastTrade: {
      __typename: 'Trade',
      price: '100',
    },
  },
};
const submit = jest.fn();
const transactionStatus = 'default';

function generateJsx(order?: Order) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <VegaWalletContext.Provider value={{} as any}>
      <DealTicket
        defaultOrder={order}
        market={market}
        submit={submit}
        transactionStatus={transactionStatus}
      />
    </VegaWalletContext.Provider>
  );
}

describe('DealTicket', () => {
  it('Displays ticket defaults', () => {
    render(generateJsx());

    // Assert defaults are used
    expect(
      screen.getByTestId(`order-type-${OrderType.TYPE_MARKET}-selected`)
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('order-side-SIDE_BUY-selected')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('order-side-SIDE_SELL-selected')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      String(1 / Math.pow(10, market.positionDecimalPlaces))
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Assert last price is shown
    expect(screen.getByTestId('last-price')).toHaveTextContent(
      // eslint-disable-next-line
      `~${addDecimal(market.depth.lastTrade!.price, market.decimalPlaces)} ${
        market.tradableInstrument.instrument.product.quoteName
      }`
    );
  });

  it('Can edit deal ticket', async () => {
    render(generateJsx());

    // BUY is selected by default
    screen.getByTestId('order-side-SIDE_BUY-selected');

    await act(async () => {
      fireEvent.change(screen.getByTestId('order-size'), {
        target: { value: '200' },
      });
    });

    expect(screen.getByTestId('order-size')).toHaveDisplayValue('200');

    fireEvent.change(screen.getByTestId('order-tif'), {
      target: { value: OrderTimeInForce.TIME_IN_FORCE_IOC },
    });
    expect(screen.getByTestId('order-tif')).toHaveValue(
      OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Switch to limit order
    fireEvent.click(screen.getByTestId('order-type-TYPE_LIMIT'));

    // Assert price input shown with default value
    expect(screen.getByTestId('order-price')).toHaveDisplayValue('0');

    // Check all TIF options shown
    expect(screen.getByTestId('order-tif').children).toHaveLength(
      Object.keys(OrderTimeInForce).length
    );
  });

  it('Handles TIF select box dependent on order type', () => {
    render(generateJsx());

    // Check only IOC and
    expect(
      Array.from(screen.getByTestId('order-tif').children).map(
        (o) => o.textContent
      )
    ).toEqual(['Fill or Kill (FOK)', 'Immediate or Cancel (IOC)']);

    // Switch to limit order and check all TIF options shown
    fireEvent.click(screen.getByTestId('order-type-TYPE_LIMIT'));
    expect(screen.getByTestId('order-tif').children).toHaveLength(
      Object.keys(OrderTimeInForce).length
    );

    // Change to GTC
    fireEvent.change(screen.getByTestId('order-tif'), {
      target: { value: OrderTimeInForce.TIME_IN_FORCE_GTC },
    });
    expect(screen.getByTestId('order-tif')).toHaveValue(
      OrderTimeInForce.TIME_IN_FORCE_GTC
    );

    // Switch back to market order and TIF should now be IOC
    fireEvent.click(screen.getByTestId('order-type-TYPE_MARKET'));
    expect(screen.getByTestId('order-tif')).toHaveValue(
      OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Switch tif to FOK
    fireEvent.change(screen.getByTestId('order-tif'), {
      target: { value: OrderTimeInForce.TIME_IN_FORCE_FOK },
    });
    expect(screen.getByTestId('order-tif')).toHaveValue(
      OrderTimeInForce.TIME_IN_FORCE_FOK
    );

    // Change back to limit and check we are still on FOK
    fireEvent.click(screen.getByTestId('order-type-TYPE_LIMIT'));
    expect(screen.getByTestId('order-tif')).toHaveValue(
      OrderTimeInForce.TIME_IN_FORCE_GTC
    );
  });
});
