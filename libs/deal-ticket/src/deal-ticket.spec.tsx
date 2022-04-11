import '@testing-library/jest-dom';
import {
  VegaWalletContext,
  OrderTimeInForce,
  OrderType,
} from '@vegaprotocol/wallet';
import { addDecimal } from '@vegaprotocol/react-helpers';
import { fireEvent, render, screen } from '@testing-library/react';
import { DealTicket } from './deal-ticket';
import type { Order } from './use-order-state';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';

const order: Order = {
  type: OrderType.Market,
  size: '100',
  timeInForce: OrderTimeInForce.FOK,
  side: null,
};
const market: DealTicketQuery_market = {
  __typename: 'Market',
  id: 'market-id',
  decimalPlaces: 2,
  tradingMode: MarketTradingMode.Continuous,
  state: MarketState.Active,
  tradableInstrument: {
    __typename: 'TradableInstrument',
    instrument: {
      __typename: 'Instrument',
      product: {
        __typename: 'Future',
        quoteName: 'quote-name',
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

function generateJsx() {
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

test('Deal ticket defaults', () => {
  render(generateJsx());

  // Assert defaults are used
  expect(
    screen.getByTestId(`order-type-${order.type}-selected`)
  ).toBeInTheDocument();
  expect(
    screen.queryByTestId('order-side-SIDE_BUY-selected')
  ).not.toBeInTheDocument();
  expect(
    screen.queryByTestId('order-side-SIDE_SELL-selected')
  ).not.toBeInTheDocument();
  expect(screen.getByTestId('order-size')).toHaveDisplayValue(order.size);
  expect(screen.getByTestId('order-tif')).toHaveValue(order.timeInForce);

  // Assert last price is shown
  expect(screen.getByTestId('last-price')).toHaveTextContent(
    // eslint-disable-next-line
    `~${addDecimal(market.depth.lastTrade!.price, market.decimalPlaces)} ${
      market.tradableInstrument.instrument.product.quoteName
    }`
  );
});

test('Can edit deal ticket', () => {
  render(generateJsx());

  // Asssert changing values
  fireEvent.click(screen.getByTestId('order-side-SIDE_BUY'));
  expect(
    screen.getByTestId('order-side-SIDE_BUY-selected')
  ).toBeInTheDocument();

  fireEvent.change(screen.getByTestId('order-size'), {
    target: { value: '200' },
  });
  expect(screen.getByTestId('order-size')).toHaveDisplayValue('200');

  fireEvent.change(screen.getByTestId('order-tif'), {
    target: { value: OrderTimeInForce.IOC },
  });
  expect(screen.getByTestId('order-tif')).toHaveValue(OrderTimeInForce.IOC);

  // Switch to limit order
  fireEvent.click(screen.getByTestId('order-type-TYPE_LIMIT'));

  // Assert price input shown with default value
  expect(screen.getByTestId('order-price')).toHaveDisplayValue('0');

  // Check all TIF options shown
  expect(screen.getByTestId('order-tif').children).toHaveLength(
    Object.keys(OrderTimeInForce).length
  );
});

test('Handles TIF select box dependent on order type', () => {
  render(generateJsx());

  // Check only IOC and
  expect(
    Array.from(screen.getByTestId('order-tif').children).map(
      (o) => o.textContent
    )
  ).toEqual(['IOC', 'FOK']);

  // Switch to limit order and check all TIF options shown
  fireEvent.click(screen.getByTestId('order-type-TYPE_LIMIT'));
  expect(screen.getByTestId('order-tif').children).toHaveLength(
    Object.keys(OrderTimeInForce).length
  );

  // Change to GTC
  fireEvent.change(screen.getByTestId('order-tif'), {
    target: { value: OrderTimeInForce.GTC },
  });
  expect(screen.getByTestId('order-tif')).toHaveValue(OrderTimeInForce.GTC);

  // Switch back to market order and TIF should now be IOC
  fireEvent.click(screen.getByTestId('order-type-TYPE_MARKET'));
  expect(screen.getByTestId('order-tif')).toHaveValue(OrderTimeInForce.IOC);

  // Switch tif to FOK
  fireEvent.change(screen.getByTestId('order-tif'), {
    target: { value: OrderTimeInForce.FOK },
  });
  expect(screen.getByTestId('order-tif')).toHaveValue(OrderTimeInForce.FOK);

  // Change back to limit and check we are still on FOK
  fireEvent.click(screen.getByTestId('order-type-TYPE_LIMIT'));
  expect(screen.getByTestId('order-tif')).toHaveValue(OrderTimeInForce.FOK);
});
