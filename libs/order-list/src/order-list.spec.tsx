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
  expect(cells[0]).toHaveTextContent(
    marketOrder.market.tradableInstrument.instrument.code
  );
  expect(cells[1]).toHaveTextContent('+10');
  expect(cells[2]).toHaveTextContent(marketOrder.type);
  expect(cells[3]).toHaveTextContent(marketOrder.status);
  expect(cells[4]).toHaveTextContent('5');
  expect(cells[5]).toHaveTextContent('-');
  expect(cells[6]).toHaveTextContent(marketOrder.timeInForce);
  expect(cells[7]).toHaveTextContent(
    getDateTimeFormat().format(new Date(marketOrder.createdAt))
  );
});

test('Correct formatting applied for GTT limit order', async () => {
  await act(async () => {
    render(<OrderList orders={[limitOrder]} />);
  });
  const cells = screen.getAllByRole('gridcell');
  expect(cells[0]).toHaveTextContent(
    limitOrder.market.tradableInstrument.instrument.code
  );
  expect(cells[1]).toHaveTextContent('-10');
  expect(cells[2]).toHaveTextContent(limitOrder.type);
  expect(cells[3]).toHaveTextContent(limitOrder.status);
  expect(cells[4]).toHaveTextContent('5');
  expect(cells[5]).toHaveTextContent(
    formatNumber(limitOrder.price, limitOrder.market.decimalPlaces)
  );
  expect(cells[6].textContent).toBe(
    `${limitOrder.timeInForce}: ${getDateTimeFormat().format(
      new Date(limitOrder.expiresAt)
    )}`
  );
  expect(cells[7]).toHaveTextContent(
    getDateTimeFormat().format(new Date(limitOrder.createdAt))
  );
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
