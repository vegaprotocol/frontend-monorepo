import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { formatNumber, getDateTimeFormat } from '@vegaprotocol/react-helpers';
import {
  OrderStatus,
  OrderTimeInForce,
  OrderType,
  Side,
  OrderRejectionReason,
} from '@vegaprotocol/graphql';
import { OrderList } from './order-list';

test('No orders message shown', async () => {
  await act(async () => {
    render(<OrderList orders={[]} />);
  });
  expect(screen.getByText('No orders')).toBeInTheDocument();
});

const marketOrder = {
  id: 'order-id',
  market: {
    decimalPlaces: 2,
    tradableInstrument: {
      instrument: {
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
  createdAt: new Date().toISOString(),
};

const limitOrder = {
  id: 'order-id',
  market: {
    decimalPlaces: 2,
    tradableInstrument: {
      instrument: {
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
};

test('Correct columns are rendered', async () => {
  await act(async () => {
    render(<OrderList orders={[marketOrder]} />);
  });

  const headers = screen.getAllByRole('columnheader');
  expect(headers).toHaveLength(8);
  expect(headers.map((h) => h.textContent?.trim())).toEqual([
    'Market',
    'Amount',
    'Type',
    'Status',
    'Filled',
    'Price',
    'Time In Force',
    'Created At',
  ]);
});

test('Correct formatting applied for market order', async () => {
  await act(async () => {
    render(<OrderList orders={[marketOrder]} />);
  });

  const cells = screen.getAllByRole('gridcell');
  const expectedValues = [
    marketOrder.market.tradableInstrument.instrument.code,
    '+10',
    marketOrder.type,
    marketOrder.status,
    '5',
    '-',
    marketOrder.timeInForce,
    getDateTimeFormat().format(new Date(marketOrder.createdAt)),
  ];
  cells.forEach((cell, i) => {
    expect(cell).toHaveTextContent(expectedValues[i]);
  });
});

test('Correct formatting applied for GTT limit order', async () => {
  await act(async () => {
    render(<OrderList orders={[limitOrder]} />);
  });
  const cells = screen.getAllByRole('gridcell');
  const expectedValues = [
    limitOrder.market.tradableInstrument.instrument.code,
    '-10',
    limitOrder.type,
    limitOrder.status,
    '5',
    formatNumber(limitOrder.price, limitOrder.market.decimalPlaces),
    `${limitOrder.timeInForce}: ${getDateTimeFormat().format(
      new Date(limitOrder.expiresAt)
    )}`,
    getDateTimeFormat().format(new Date(limitOrder.createdAt)),
  ];
  cells.forEach((cell, i) => {
    expect(cell).toHaveTextContent(expectedValues[i]);
  });
});

test('Correct formatting applied for a rejected order', async () => {
  const rejectedOrder = {
    ...marketOrder,
    status: OrderStatus.Rejected,
    rejectionReason: OrderRejectionReason.InsufficientAssetBalance,
  };
  await act(async () => {
    render(<OrderList orders={[rejectedOrder]} />);
  });
  const cells = screen.getAllByRole('gridcell');
  expect(cells[3]).toHaveTextContent(
    `${rejectedOrder.status}: ${rejectedOrder.rejectionReason}`
  );
});
