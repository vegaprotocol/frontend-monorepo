import type { RenderResult } from '@testing-library/react';
import { act, render, screen } from '@testing-library/react';
import PositionsTable from './positions-table';
import type { Position } from './data-providers';
import { MarketTradingMode } from '@vegaprotocol/types';

const singleRow: Position = {
  marketName: 'ETH/BTC (31 july 2022)',
  averageEntryPrice: '133', // 13.3
  capitalUtilisation: 11, // 11.00%
  currentLeverage: 1.1,
  marketDecimalPlaces: 1,
  positionDecimalPlaces: 0,
  assetDecimals: 2,
  totalBalance: '123456',
  assetSymbol: 'BTC',
  liquidationPrice: '83', // 8.3
  lowMarginLevel: false,
  marketId: 'string',
  marketTradingMode: MarketTradingMode.Continuous,
  markPrice: '123', // 12.3
  notional: '12300', // 1230.0
  openVolume: '100', // 100
  realisedPNL: '123', // 1.23
  unrealisedPNL: '456', // 4.56
  searchPrice: '0',
  updatedAt: '2022-07-27T15:02:58.400Z',
};

const singleRowData = [singleRow];

it('should render successfully', async () => {
  await act(async () => {
    const { baseElement } = render(<PositionsTable rowData={[]} />);
    expect(baseElement).toBeTruthy();
  });
});

it('Render correct columns', async () => {
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
  });

  const headers = screen.getAllByRole('columnheader');
  expect(headers).toHaveLength(9);
  expect(
    headers.map((h) => h.querySelector('[ref="eText"]')?.textContent?.trim())
  ).toEqual([
    'Market',
    'Amount',
    'Mark Price',
    'Entry Price',
    'Leverage',
    'Margin allocated',
    'Realised PNL',
    'Unrealised PNL',
    'Updated',
  ]);
});

it('Splits market name', async () => {
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
  });
  expect(screen.getByText('ETH/BTC')).toBeTruthy();
  expect(screen.getByText('31 july 2022')).toBeTruthy();
});

it('add color and sign to amount, displays positive notional value', async () => {
  let result: RenderResult;
  await act(async () => {
    result = render(<PositionsTable rowData={singleRowData} />);
  });
  let cells = screen.getAllByRole('gridcell');
  let values = cells[1].querySelectorAll('.text-right');
  expect(values[0].classList.contains('text-vega-green-dark')).toBeTruthy();
  expect(values[0].classList.contains('text-vega-red-dark')).toBeFalsy();
  expect(values[0].textContent).toEqual('+100');
  expect(values[1].textContent).toEqual('1,230.0');
  await act(async () => {
    result.rerender(
      <PositionsTable rowData={[{ ...singleRow, openVolume: '-100' }]} />
    );
  });
  cells = screen.getAllByRole('gridcell');
  values = cells[1].querySelectorAll('.text-right');
  expect(values[0].classList.contains('text-vega-green-dark')).toBeFalsy();
  expect(values[0].classList.contains('text-vega-red-dark')).toBeTruthy();
  expect(values[0].textContent?.startsWith('-100')).toBeTruthy();
  expect(values[1].textContent).toEqual('1,230.0');
});

it('displays mark price', async () => {
  let result: RenderResult;
  await act(async () => {
    result = render(<PositionsTable rowData={singleRowData} />);
  });

  let cells = screen.getAllByRole('gridcell');
  expect(cells[2].textContent).toEqual('12.3');

  await act(async () => {
    result.rerender(
      <PositionsTable
        rowData={[
          { ...singleRow, marketTradingMode: MarketTradingMode.OpeningAuction },
        ]}
      />
    );
  });

  cells = screen.getAllByRole('gridcell');
  expect(cells[2].textContent).toEqual('-');
});

it("displays properly entry, liquidation price and liquidation bar and it's intent", async () => {
  let result: RenderResult;
  await act(async () => {
    result = render(<PositionsTable rowData={singleRowData} />);
  });
  let cells = screen.getAllByRole('gridcell');
  let cell = cells[3];
  const entryPrice = cell.firstElementChild?.firstElementChild?.textContent;
  const liquidationPrice =
    cell.firstElementChild?.lastElementChild?.textContent;
  const progressBarTrack = cell.lastElementChild;
  let progressBar = progressBarTrack?.firstElementChild as HTMLElement;
  const progressBarWidth = progressBar?.style?.width;
  expect(entryPrice).toEqual('13.3');
  expect(liquidationPrice).toEqual('8.3');
  expect(progressBar.classList.contains('bg-danger')).toEqual(false);
  expect(progressBarWidth).toEqual('20%');
  await act(async () => {
    result.rerender(
      <PositionsTable rowData={[{ ...singleRow, lowMarginLevel: true }]} />
    );
  });
  cells = screen.getAllByRole('gridcell');
  cell = cells[3];
  progressBar = cell.lastElementChild?.firstElementChild as HTMLElement;
  expect(progressBar?.classList.contains('bg-danger')).toEqual(true);
});

it('displays leverage', async () => {
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
  });
  const cells = screen.getAllByRole('gridcell');
  expect(cells[4].textContent).toEqual('1.1');
});

it('displays allocated margin and margin bar', async () => {
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
  });
  const cells = screen.getAllByRole('gridcell');
  const cell = cells[5];
  const capitalUtilisation =
    cell.firstElementChild?.firstElementChild?.textContent;
  const totalBalance = cell.firstElementChild?.lastElementChild?.textContent;
  const progressBarTrack = cell.lastElementChild;
  const progressBar = progressBarTrack?.firstElementChild as HTMLElement;
  const progressBarWidth = progressBar?.style?.width;
  expect(capitalUtilisation).toEqual('11.00%');
  expect(totalBalance).toEqual('1,234.56');
  expect(progressBarWidth).toEqual('11%');
});

it('displays realised and unrealised PNL', async () => {
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
  });
  const cells = screen.getAllByRole('gridcell');
  expect(cells[6].textContent).toEqual('1.23');
  expect(cells[7].textContent).toEqual('4.56');
});
