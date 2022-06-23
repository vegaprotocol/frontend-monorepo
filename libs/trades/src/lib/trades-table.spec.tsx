import { act, render, screen } from '@testing-library/react';
import { getDateTimeFormat } from '@vegaprotocol/react-helpers';
import { DOWN_CLASS, TradesTable, UP_CLASS } from './trades-table';
import type { TradeFields } from './__generated__/TradeFields';

const trade: TradeFields = {
  __typename: 'Trade',
  id: 'trade-id',
  price: '111122200',
  size: '2000',
  createdAt: new Date('2022-04-06T19:00:00').toISOString(),
  market: {
    __typename: 'Market',
    id: 'market-id',
    decimalPlaces: 2,
    positionDecimalPlaces: 2,
  },
};

it('Correct columns are rendered', async () => {
  await act(async () => {
    render(<TradesTable data={[trade]} />);
  });
  const expectedHeaders = ['Price', 'Size', 'Created at'];
  const headers = screen.getAllByRole('columnheader');
  expect(headers).toHaveLength(expectedHeaders.length);
  expect(headers.map((h) => h.textContent?.trim())).toEqual(expectedHeaders);
});

it('Number and data columns are formatted', async () => {
  await act(async () => {
    render(<TradesTable data={[trade]} />);
  });

  const cells = screen.getAllByRole('gridcell');
  const expectedValues = [
    '1,111,222.00',
    '20.00',
    getDateTimeFormat().format(new Date(trade.createdAt)),
  ];
  cells.forEach((cell, i) => {
    expect(cell).toHaveTextContent(expectedValues[i]);
  });
});

it('Price and size columns are formatted', async () => {
  const trade2 = {
    ...trade,
    id: 'trade-id-2',
    price: (Number(trade.price) + 10).toString(),
    size: (Number(trade.size) - 10).toString(),
  };
  await act(async () => {
    render(<TradesTable data={[trade2, trade]} />);
  });

  const cells = screen.getAllByRole('gridcell');

  const priceCells = cells.filter(
    (cell) => cell.getAttribute('col-id') === 'price'
  );
  const sizeCells = cells.filter(
    (cell) => cell.getAttribute('col-id') === 'size'
  );

  // For first trade price should have green class and size should have red class
  // row 1
  expect(priceCells[0]).toHaveClass(UP_CLASS);
  expect(priceCells[1]).not.toHaveClass(DOWN_CLASS);
  expect(priceCells[1]).not.toHaveClass(UP_CLASS);

  expect(sizeCells[0]).toHaveClass(DOWN_CLASS);
  expect(sizeCells[1]).not.toHaveClass(DOWN_CLASS);
  expect(sizeCells[1]).not.toHaveClass(UP_CLASS);
});
