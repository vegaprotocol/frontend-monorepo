import type { RenderResult } from '@testing-library/react';
import { act, render, screen } from '@testing-library/react';
import PositionsTable from './positions-table';
import type { Position } from './positions-data-providers';
import * as Schema from '@vegaprotocol/types';
import { PositionStatus } from '@vegaprotocol/types';

const singleRow: Position = {
  marketName: 'ETH/BTC (31 july 2022)',
  averageEntryPrice: '133',
  capitalUtilisation: 11,
  currentLeverage: 1.1,
  marketDecimalPlaces: 1,
  positionDecimalPlaces: 0,
  decimals: 2,
  totalBalance: '123456',
  assetSymbol: 'BTC',
  liquidationPrice: '83',
  lowMarginLevel: false,
  marketId: 'string',
  marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
  markPrice: '123',
  notional: '12300',
  openVolume: '100',
  realisedPNL: '123',
  unrealisedPNL: '456',
  searchPrice: '0',
  updatedAt: '2022-07-27T15:02:58.400Z',
  marginAccountBalance: '12345600',
  status: PositionStatus.POSITION_STATUS_UNSPECIFIED,
  lossSocializationAmount: '0',
};

const singleRowData = [singleRow];

it('should render successfully', async () => {
  await act(async () => {
    const { baseElement } = render(
      <PositionsTable rowData={[]} isReadOnly={false} />
    );
    expect(baseElement).toBeTruthy();
  });
});

it('render correct columns', async () => {
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} isReadOnly={true} />);
  });

  const headers = screen.getAllByRole('columnheader');
  expect(headers).toHaveLength(12);
  expect(
    headers.map((h) => h.querySelector('[ref="eText"]')?.textContent?.trim())
  ).toEqual([
    'Market',
    'Notional',
    'Open volume',
    'Mark price',
    'Settlement asset',
    'Entry price',
    'Liquidation price (est)',
    'Leverage',
    'Margin allocated',
    'Realised PNL',
    'Unrealised PNL',
    'Updated',
  ]);
});

it('renders market name', async () => {
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} isReadOnly={false} />);
  });
  expect(screen.getByText('ETH/BTC (31 july 2022)')).toBeTruthy();
});

it('Does not fail if the market name does not match the split pattern', async () => {
  const breakingMarketName = 'OP/USD AUG-SEP22 - Incentive';
  const row = [
    Object.assign({}, singleRow, { marketName: breakingMarketName }),
  ];
  await act(async () => {
    render(<PositionsTable rowData={row} isReadOnly={false} />);
  });

  expect(screen.getByText(breakingMarketName)).toBeTruthy();
});

it('add color and sign to amount, displays positive notional value', async () => {
  let result: RenderResult;
  await act(async () => {
    result = render(
      <PositionsTable rowData={singleRowData} isReadOnly={false} />
    );
  });
  let cells = screen.getAllByRole('gridcell');

  expect(cells[2].classList.contains('text-vega-green-550')).toBeTruthy();
  expect(cells[2].classList.contains('text-vega-pink')).toBeFalsy();
  expect(cells[2].textContent).toEqual('+100');
  expect(cells[1].textContent).toEqual('1,230.0');
  await act(async () => {
    result.rerender(
      <PositionsTable
        rowData={[{ ...singleRow, openVolume: '-100' }]}
        isReadOnly={false}
      />
    );
  });
  cells = screen.getAllByRole('gridcell');
  expect(cells[2].classList.contains('text-vega-green-550')).toBeFalsy();
  expect(cells[2].classList.contains('text-vega-pink')).toBeTruthy();
  expect(cells[2].textContent?.startsWith('-100')).toBeTruthy();
  expect(cells[1].textContent).toEqual('1,230.0');
});

it('displays mark price', async () => {
  let result: RenderResult;
  await act(async () => {
    result = render(
      <PositionsTable rowData={singleRowData} isReadOnly={false} />
    );
  });

  let cells = screen.getAllByRole('gridcell');
  expect(cells[3].textContent).toEqual('12.3');

  await act(async () => {
    result.rerender(
      <PositionsTable
        rowData={[
          {
            ...singleRow,
            marketTradingMode:
              Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
          },
        ]}
        isReadOnly={false}
      />
    );
  });

  cells = screen.getAllByRole('gridcell');
  expect(cells[3].textContent).toEqual('-');
});

it("displays properly entry, liquidation price and liquidation bar and it's intent", async () => {
  let result: RenderResult;
  await act(async () => {
    result = render(
      <PositionsTable rowData={singleRowData} isReadOnly={false} />
    );
  });
  let cells = screen.getAllByRole('gridcell');
  const entryPrice = cells[5].firstElementChild?.firstElementChild?.textContent;
  expect(entryPrice).toEqual('13.3');
  await act(async () => {
    result.rerender(
      <PositionsTable
        rowData={[{ ...singleRow, lowMarginLevel: true }]}
        isReadOnly={false}
      />
    );
  });
  cells = screen.getAllByRole('gridcell');
});

it('displays leverage', async () => {
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} isReadOnly={false} />);
  });
  const cells = screen.getAllByRole('gridcell');
  expect(cells[7].textContent).toEqual('1.1');
});

it('displays allocated margin', async () => {
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} isReadOnly={false} />);
  });
  const cells = screen.getAllByRole('gridcell');
  const cell = cells[8];
  expect(cell.textContent).toEqual('123,456.00');
});

it('displays realised and unrealised PNL', async () => {
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} isReadOnly={false} />);
  });
  const cells = screen.getAllByRole('gridcell');
  expect(cells[9].textContent).toEqual('1.23');
  expect(cells[10].textContent).toEqual('4.56');
});

it('displays close button', async () => {
  await act(async () => {
    render(
      <PositionsTable
        rowData={singleRowData}
        onClose={() => {
          return;
        }}
        isReadOnly={false}
      />
    );
  });
  const cells = screen.getAllByRole('gridcell');
  expect(cells[12].textContent).toEqual('Close');
});

it('do not display close button if openVolume is zero', async () => {
  await act(async () => {
    render(
      <PositionsTable
        rowData={[{ ...singleRow, openVolume: '0' }]}
        onClose={() => {
          return;
        }}
        isReadOnly={false}
      />
    );
  });
  const cells = screen.getAllByRole('gridcell');
  expect(cells[12].textContent).toEqual('');
});
