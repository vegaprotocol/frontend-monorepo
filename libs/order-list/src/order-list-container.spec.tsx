import { render, screen } from '@testing-library/react';
import { OrderListContainer } from './order-list-container';
import * as useOrdersHook from './use-orders';
import { Orders_party_orders } from './__generated__/Orders';

jest.mock('./order-list', () => ({
  OrderList: () => <div>OrderList</div>,
}));

test('Renders a loading state while awaiting orders', () => {
  jest.spyOn(useOrdersHook, 'useOrders').mockReturnValue({
    orders: [],
    loading: true,
    error: null,
  });
  render(<OrderListContainer />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

test('Renders an error state', () => {
  const errorMsg = 'Oops! An Error';
  jest.spyOn(useOrdersHook, 'useOrders').mockReturnValue({
    orders: [],
    loading: false,
    error: new Error(errorMsg),
  });
  render(<OrderListContainer />);
  expect(
    screen.getByText(`Something went wrong: ${errorMsg}`)
  ).toBeInTheDocument();
});

test('Renders the order list if orders provided', async () => {
  jest.spyOn(useOrdersHook, 'useOrders').mockReturnValue({
    orders: [{ id: '1' } as Orders_party_orders],
    loading: false,
    error: null,
  });
  render(<OrderListContainer />);
  expect(await screen.findByText('OrderList')).toBeInTheDocument();
});
