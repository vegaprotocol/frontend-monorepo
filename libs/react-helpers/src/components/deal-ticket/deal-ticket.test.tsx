import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { DealTicket } from './';
import {
  Order,
  OrderTimeInForce,
  OrderType,
} from '../../hooks/use-order-state';

test('Deal ticket order', () => {
  const order: Order = {
    type: OrderType.Market,
    size: '100',
    timeInForce: OrderTimeInForce.FOK,
    side: null,
  };
  render(<DealTicket defaultOrder={order} />);

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
  expect(screen.getByTestId('order-size')).toHaveValue(order.size);
  expect(screen.getByTestId('order-tif')).toHaveValue(order.timeInForce);

  // Asssert changing values
  fireEvent.click(screen.getByTestId('order-side-SIDE_BUY'));
  expect(
    screen.getByTestId('order-side-SIDE_BUY-selected')
  ).toBeInTheDocument();

  fireEvent.change(screen.getByTestId('order-size'), {
    target: { value: '200' },
  });
  expect(screen.getByTestId('order-size')).toHaveValue('200');

  fireEvent.change(screen.getByTestId('order-tif'), {
    target: { value: OrderTimeInForce.IOC },
  });
  expect(screen.getByTestId('order-tif')).toHaveValue(OrderTimeInForce.IOC);

  // Switch to limit order
  fireEvent.click(screen.getByTestId('order-type-TYPE_LIMIT'));

  // Assert price input shown with default value
  expect(screen.getByTestId('order-price')).toHaveValue('0');

  // Check all TIF options shown
  expect(screen.getByTestId('order-tif').children).toHaveLength(
    Object.keys(OrderTimeInForce).length
  );

  // Switch to GTC
  fireEvent.change(screen.getByTestId('order-tif'), {
    target: { value: OrderTimeInForce.GTC },
  });
  expect(screen.getByTestId('order-tif')).toHaveValue(OrderTimeInForce.GTC);

  // Switch back to market order and TIF should now be IOC
  fireEvent.click(screen.getByTestId('order-type-TYPE_MARKET'));
  expect(screen.getByTestId('order-tif')).toHaveValue(OrderTimeInForce.IOC);
});
