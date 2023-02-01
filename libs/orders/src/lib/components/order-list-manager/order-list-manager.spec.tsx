import { render, screen } from '@testing-library/react';
import { OrderListManager } from './order-list-manager';
import * as useDataProviderHook from '@vegaprotocol/react-helpers';
import type { OrderFieldsFragment } from '../';
import * as orderListMock from '../order-list/order-list';
import { forwardRef } from 'react';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { MockedProvider } from '@apollo/client/testing';

const generateJsx = () => {
  const pubKey = '0x123';
  return (
    <MockedProvider>
      <VegaWalletContext.Provider value={{ pubKey } as VegaWalletContextShape}>
        <OrderListManager partyId={pubKey} isReadOnly={false} />
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
};

it('Renders a loading state while awaiting orders', () => {
  jest.spyOn(useDataProviderHook, 'useDataProvider').mockReturnValue({
    data: [],
    loading: true,
    error: undefined,
    flush: jest.fn(),
    reload: jest.fn(),
    load: jest.fn(),
    totalCount: 0,
  });
  render(generateJsx());
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

it('Renders an error state', () => {
  const errorMsg = 'Oops! An Error';
  jest.spyOn(useDataProviderHook, 'useDataProvider').mockReturnValue({
    data: [],
    loading: false,
    error: new Error(errorMsg),
    flush: jest.fn(),
    reload: jest.fn(),
    load: jest.fn(),
    totalCount: undefined,
  });
  render(generateJsx());
  expect(
    screen.getByText(`Something went wrong: ${errorMsg}`)
  ).toBeInTheDocument();
});

it('Renders the order list if orders provided', async () => {
  // @ts-ignore Orderlist is read only but we need to override with the forwardref to
  // avoid warnings about padding refs
  orderListMock.OrderListTable = forwardRef(() => <div>OrderList</div>);
  jest.spyOn(useDataProviderHook, 'useDataProvider').mockReturnValue({
    data: [{ id: '1' } as OrderFieldsFragment],
    loading: false,
    error: undefined,
    flush: jest.fn(),
    reload: jest.fn(),
    load: jest.fn(),
    totalCount: undefined,
  });
  render(generateJsx());
  expect(await screen.findByText('OrderList')).toBeInTheDocument();
});
