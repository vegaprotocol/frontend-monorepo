import { render, screen } from '@testing-library/react';
import { OrderListManager } from './order-list-manager';
import * as useDataProviderHook from '@vegaprotocol/react-helpers';
import type { Orders_party_orders } from '../__generated__/Orders';
import * as orderListMock from '../order-list';
import { forwardRef } from 'react';

jest.mock('./order-list');

it('Renders a loading state while awaiting orders', () => {
  jest.spyOn(useDataProviderHook, 'useDataProvider').mockReturnValue({
    data: [],
    loading: true,
    error: undefined,
  });
  render(<OrderListManager partyId="0x123" />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

it('Renders an error state', () => {
  const errorMsg = 'Oops! An Error';
  jest.spyOn(useDataProviderHook, 'useDataProvider').mockReturnValue({
    data: [],
    loading: false,
    error: new Error(errorMsg),
  });
  render(<OrderListManager partyId="0x123" />);
  expect(
    screen.getByText(`Something went wrong: ${errorMsg}`)
  ).toBeInTheDocument();
});

it('Renders the order list if orders provided', async () => {
  // @ts-ignore Orderlist is read only but we need to override with the forwardref to
  // avoid warnings about padding refs
  orderListMock.OrderList = forwardRef(() => <div>OrderList</div>);
  jest.spyOn(useDataProviderHook, 'useDataProvider').mockReturnValue({
    data: [{ id: '1' } as Orders_party_orders],
    loading: false,
    error: undefined,
  });
  render(<OrderListManager partyId="0x123" />);
  expect(await screen.findByText('OrderList')).toBeInTheDocument();
});
