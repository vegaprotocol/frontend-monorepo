import { act, render, screen } from '@testing-library/react';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import { SELL_CLASS, TradesTable, BUY_CLASS } from './trades-table';
import type { Trade } from './trades-data-provider';
import { Side } from '@vegaprotocol/types';

const trade: Trade = {
  __typename: 'Trade',
  id: 'trade-id',
  price: '111122200',
  size: '2000',
  aggressor: Side.SIDE_BUY,
  createdAt: new Date('2022-04-06T19:00:00').toISOString(),
  market: {
    __typename: 'Market',
    id: 'market-id',
    decimalPlaces: 2,
    positionDecimalPlaces: 2,
  } as Trade['market'],
};

describe('TradesTable', () => {
  it('should render correct columns', async () => {
    await act(async () => {
      render(<TradesTable rowData={[trade]} />);
    });
    const expectedHeaders = ['Price', 'Size', 'Created at'];
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(headers.map((h) => h.textContent?.trim())).toEqual(expectedHeaders);
  });

  it('should format number and data columns', async () => {
    await act(async () => {
      render(<TradesTable rowData={[trade]} />);
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

  it('should format price and size columns', async () => {
    const trade2 = {
      ...trade,
      id: 'trade-id-2',
      price: (Number(trade.price) + 10).toString(),
      size: (Number(trade.size) - 10).toString(),
    };
    await act(async () => {
      render(<TradesTable rowData={[trade2, trade]} />);
    });

    const cells = screen.getAllByRole('gridcell');

    const priceCells = cells.filter(
      (cell) => cell.getAttribute('col-id') === 'price'
    );
    const sizeCells = cells.filter(
      (cell) => cell.getAttribute('col-id') === 'size'
    );

    // For first trade price should have green class
    // row 1
    expect(priceCells[0]).toHaveClass(BUY_CLASS);
    expect(priceCells[1]).not.toHaveClass(SELL_CLASS);
    expect(sizeCells[1]).not.toHaveClass(SELL_CLASS);
    expect(sizeCells[1]).not.toHaveClass(BUY_CLASS);
  });
});
