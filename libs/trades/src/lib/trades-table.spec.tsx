import { act, render, screen } from '@testing-library/react';
import { getTimeFormat } from '@vegaprotocol/utils';
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
    // 6005-THIS-001
    // 6005-THIS-002
    const expectedHeaders = ['Price', 'Size', 'Created at'];
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(headers.map((h) => h.textContent?.trim())).toEqual(expectedHeaders);
  });

  it('should format number and data columns', async () => {
    // 6005-THIS-003
    // 6005-THIS-004
    await act(async () => {
      render(<TradesTable rowData={[trade]} />);
    });

    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      '1,111,222.00',
      '20.00',
      getTimeFormat().format(new Date(trade.createdAt)),
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

  it('should be in created at desc order', async () => {
    // 6005-THIS-005
    // 6005-THIS-006
    const earlierDate = new Date(trade.createdAt);
    earlierDate.setMinutes(earlierDate.getMinutes() - 1);
    const trade2 = {
      ...trade,
      id: 'trade-id-2',
      price: (Number(trade.price) + 10).toString(),
      size: (Number(trade.size) - 10).toString(),
      createdAt: earlierDate.toISOString(),
    };

    await act(async () => {
      render(<TradesTable rowData={[trade2, trade]} />);
    });

    const cells = screen.getAllByRole('gridcell');

    const createdAtCells = cells.filter(
      (cell) => cell.getAttribute('col-id') === 'createdAt'
    );

    const [firstDateCell, secondDateCell] = createdAtCells;

    const parseTime = (timeStr: string) => {
      const [_, hours, minutes, seconds, amPm] =
        timeStr.match(/(\d+):(\d+):(\d+) ?(a\.?m\.?|p\.?m\.?)?/i) || [];
      return {
        hours: parseInt(hours),
        minutes: parseInt(minutes),
        seconds: parseInt(seconds),
        amPm: (amPm || '').toLowerCase(),
      };
    };

    if (!firstDateCell.textContent || !secondDateCell.textContent) {
      throw new Error('textContent should not be null');
    }

    const firstText = firstDateCell.textContent;
    const secondText = secondDateCell.textContent;

    const firstTime = parseTime(firstText);
    const secondTime = parseTime(secondText);

    if (firstTime.amPm === 'pm' && firstTime.hours < 12) firstTime.hours += 12;
    if (secondTime.amPm === 'pm' && secondTime.hours < 12)
      secondTime.hours += 12;

    const firstCellDate = new Date(
      0,
      0,
      0,
      firstTime.hours,
      firstTime.minutes,
      firstTime.seconds
    );
    const secondCellDate = new Date(
      0,
      0,
      0,
      secondTime.hours,
      secondTime.minutes,
      secondTime.seconds
    );

    expect(secondCellDate.getTime()).toBeGreaterThan(firstCellDate.getTime());
  });
});
