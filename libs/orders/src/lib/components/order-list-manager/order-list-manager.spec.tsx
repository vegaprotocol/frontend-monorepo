import { render, screen, act } from '@testing-library/react';
import * as Schema from '@vegaprotocol/types';
import {
  OrderListManager,
  normalizeOrderAmendment,
} from './order-list-manager';
import * as useDataProviderHook from '@vegaprotocol/data-provider';
import type { OrderFieldsFragment } from '../';
import * as orderListMock from '../order-list/order-list';
import { forwardRef } from 'react';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { MockedProvider } from '@apollo/client/testing';

// @ts-ignore OrderList is read only but we need to override with the forwardRef to
// avoid warnings about padding refs
orderListMock.OrderListTable = forwardRef(() => <div>OrderList</div>);

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

describe('OrderListManager', () => {
  it('should render the order list if orders provided', async () => {
    jest.spyOn(useDataProviderHook, 'useDataProvider').mockReturnValue({
      data: [{ id: '1' } as OrderFieldsFragment],
      loading: false,
      error: undefined,
      flush: jest.fn(),
      reload: jest.fn(),
      load: jest.fn(),
    });
    await act(async () => {
      render(generateJsx());
    });
    expect(await screen.findByText('OrderList')).toBeInTheDocument();
  });
});

describe('normalizeOrderAmendment', () => {
  type Order = Parameters<typeof normalizeOrderAmendment>[0];
  type Market = Parameters<typeof normalizeOrderAmendment>[1];
  const order: Order = {
    id: '123',
    timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
    size: '100',
    expiresAt: '2022-01-01T00:00:00.000Z',
  };
  const market: Market = {
    id: '456',
    decimalPlaces: 1,
    positionDecimalPlaces: 1,
  };

  it('sets and formats order id, market id, expires and timeInForce as given', () => {
    const orderAmendment = normalizeOrderAmendment(order, market, '1', '1');
    expect(orderAmendment.orderId).toEqual('123');
    expect(orderAmendment.marketId).toEqual('456');
    expect(orderAmendment.expiresAt).toEqual('1640995200000000000');
    expect(orderAmendment.timeInForce).toEqual(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTT
    );
  });

  it.each([
    ['1.1', 1, '11'],
    ['1.1', 2, '110'],
    ['0.001', 8, '100000'],
  ])('sets and formats price', (price, decimalPlaces, output) => {
    const orderAmendment = normalizeOrderAmendment(
      order,
      { ...market, decimalPlaces },
      price,
      '1'
    );
    expect(orderAmendment.price).toEqual(output);
  });

  it.each([
    ['9', 1, -10],
    ['90', 2, 8900],
    ['0.001', 8, 99900],
  ])('sets and formats size delta', (size, positionDecimalPlaces, output) => {
    const orderAmendment = normalizeOrderAmendment(
      order,
      { ...market, positionDecimalPlaces },
      '1',
      size
    );
    expect(orderAmendment.sizeDelta).toEqual(output);
  });
});
