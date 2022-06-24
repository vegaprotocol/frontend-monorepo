import { act, render, screen } from '@testing-library/react';
import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
} from '@vegaprotocol/react-helpers';
import type { Orders_party_orders } from '../__generated__/Orders';
import {
  OrderStatus,
  OrderTimeInForce,
  OrderType,
  Side,
  OrderRejectionReason,
} from '@vegaprotocol/types';
import { OrderList } from './order-list';
import type { PartialDeep } from 'type-fest';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { MockedProvider } from '@apollo/client/testing';

const marketOrder: Orders_party_orders = {
  __typename: 'Order',
  id: 'order-id-market',
  market: {
    __typename: 'Market',
    id: 'market-id',
    name: 'market-name',
    decimalPlaces: 2,
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        __typename: 'Instrument',
        code: 'instrument-code',
      },
    },
  },
  size: '10',
  type: OrderType.Market,
  status: OrderStatus.Active,
  side: Side.Buy,
  remaining: '5',
  price: '',
  timeInForce: OrderTimeInForce.IOC,
  createdAt: new Date('2022-2-3').toISOString(),
  updatedAt: null,
  expiresAt: null,
  rejectionReason: null,
};

const limitOrder: Orders_party_orders = {
  __typename: 'Order',
  id: 'order-id-limit',
  market: {
    __typename: 'Market',
    id: 'market-id',
    name: 'market-name',
    decimalPlaces: 2,
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        __typename: 'Instrument',
        code: 'instrument-code',
      },
    },
  },
  size: '10',
  type: OrderType.Limit,
  status: OrderStatus.Active,
  side: Side.Sell,
  remaining: '5',
  price: '12345',
  timeInForce: OrderTimeInForce.GTT,
  createdAt: new Date('2022-3-3').toISOString(),
  expiresAt: new Date('2022-3-5').toISOString(),
  updatedAt: null,
  rejectionReason: null,
};

const generateJsx = (
  orders: Orders_party_orders[] | null,
  context: PartialDeep<VegaWalletContextShape> = { keypair: { pub: '0x123' } }
) => {
  return (
    <MockedProvider>
      <VegaWalletContext.Provider value={context as VegaWalletContextShape}>
        <OrderList data={orders} />
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
};

describe('OrderList', () => {
  it('No orders message shown', async () => {
    await act(async () => {
      render(generateJsx([]));
    });
    expect(screen.getByText('No orders')).toBeInTheDocument();
  });

  it('Correct columns are rendered', async () => {
    await act(async () => {
      render(generateJsx([marketOrder, limitOrder]));
    });

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(10);
    expect(headers.map((h) => h.textContent?.trim())).toEqual([
      '',
      'Market',
      'Amount',
      'Type',
      'Status',
      'Filled',
      'Price',
      'Time In Force',
      'Created At',
      'Updated At',
    ]);
  });

  it('Correct formatting applied for market order', async () => {
    await act(async () => {
      render(generateJsx([marketOrder]));
    });

    const cells = screen.getAllByRole('gridcell');
    const expectedValues: string[] = [
      marketOrder.market?.tradableInstrument.instrument.code || '',
      '+10',
      marketOrder.type || '',
      marketOrder.status,
      '5',
      '-',
      marketOrder.timeInForce,
      getDateTimeFormat().format(new Date(marketOrder.createdAt)),
      '-',
      'Cancel',
    ];
    cells.forEach((cell, i) =>
      expect(cell).toHaveTextContent(expectedValues[i])
    );
  });

  it('Correct formatting applied for GTT limit order', async () => {
    await act(async () => {
      render(generateJsx([limitOrder]));
    });
    const cells = screen.getAllByRole('gridcell');

    const expectedValues: string[] = [
      limitOrder.market?.tradableInstrument.instrument.code || '',
      '-10',
      limitOrder.type || '',
      limitOrder.status,
      '5',
      addDecimalsFormatNumber(
        limitOrder.price,
        limitOrder.market?.decimalPlaces ?? 0,
        3
      ),
      `${limitOrder.timeInForce}: ${getDateTimeFormat().format(
        new Date(limitOrder.expiresAt ?? '')
      )}`,
      getDateTimeFormat().format(new Date(limitOrder.createdAt)),
      '-',
      'Cancel',
    ];
    cells.forEach((cell, i) =>
      expect(cell).toHaveTextContent(expectedValues[i])
    );
  });

  it('Correct formatting applied for a rejected order', async () => {
    const rejectedOrder = {
      ...marketOrder,
      status: OrderStatus.Rejected,
      rejectionReason: OrderRejectionReason.InsufficientAssetBalance,
    };
    await act(async () => {
      render(generateJsx([rejectedOrder]));
    });
    const cells = screen.getAllByRole('gridcell');
    expect(cells[3]).toHaveTextContent(
      `${rejectedOrder.status}: ${rejectedOrder.rejectionReason}`
    );
  });
});
