import { act, render, screen, waitFor } from '@testing-library/react';
import PositionsTable from './positions-table';
import type { Position } from './positions-metrics-data-provider';
import { MarketTradingMode } from '@vegaprotocol/types';

const singleRow: Position = {
  marketName: 'ETH/BTC (31 july 2022)',
  averageEntryPrice: '133', // 13.3
  capitalUtilisation: 11, // 11.00%
  currentLeverage: 1.1,
  marketDecimalPlaces: 1,
  positionDecimalPlaces: 0,
  assetDecimals: 2,
  // generalAccountBalance: '0',
  totalBalance: '123456',
  assetSymbol: 'BTC',
  // leverageInitial: '0',
  // leverageMaintenance: '0',
  // leverageRelease: '0',
  // leverageSearch: '0',
  liquidationPrice: '83', // 8.3
  // marginAccountBalance: '0',
  lowMarginLevel: false,
  // marginMaintenance: '0',
  // marginSearch: '0',
  // marginInitial: '0',
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
  act(async () => {
    const { baseElement } = render(<PositionsTable rowData={[]} />);
    expect(baseElement).toBeTruthy();
  });
});

it('Render correct columns', async () => {
  act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
    await waitFor(async () => {
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(9);
      expect(
        headers.map((h) =>
          h.querySelector('[ref="eText"]')?.textContent?.trim()
        )
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
  });
});

it('Splits market name', async () => {
  act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
    await waitFor(async () => {
      expect(screen.getByText('ETH/BTC')).toBeTruthy();
      expect(screen.getByText('31 july 2022')).toBeTruthy();
    });
  });
});

it('add color and sign to amount, displays positive notional value', async () => {
  act(async () => {
    const result = render(<PositionsTable rowData={singleRowData} />);
    await waitFor(async () => {
      const cells = screen.getAllByRole('gridcell');
      const values = cells[1].querySelectorAll('.text-right');
      expect(values[0].classList.contains('color-vega-green')).toBeTruthy();
      expect(values[0].classList.contains('color-vega-red')).toBeFalsy();
      expect(values[0].textContent).toEqual('+100');
      expect(values[1].textContent).toEqual('1,230.0');
    });
    result.rerender(
      <PositionsTable rowData={[{ ...singleRow, openVolume: '-100' }]} />
    );
    await waitFor(async () => {
      const cells = screen.getAllByRole('gridcell');
      const values = cells[1].querySelectorAll('.text-right');
      expect(values[0].classList.contains('color-vega-green')).toBeFalsy();
      expect(values[0].classList.contains('color-vega-red')).toBeTruthy();
      expect(values[0].textContent?.startsWith('-100')).toBeTruthy();
      expect(values[1].textContent).toEqual('1,230.0');
    });
  });
});

it('displays mark price', async () => {
  act(async () => {
    const result = render(<PositionsTable rowData={singleRowData} />);
    await waitFor(async () => {
      const cells = screen.getAllByRole('gridcell');
      expect(cells[2].textContent).toEqual('12.3');
    });
    result.rerender(
      <PositionsTable
        rowData={[
          { ...singleRow, marketTradingMode: MarketTradingMode.OpeningAuction },
        ]}
      />
    );
    await waitFor(async () => {
      const cells = screen.getAllByRole('gridcell');
      expect(cells[2].textContent).toEqual('-');
    });
  });
});

it("displays properly entry, liquidation price and liquidation bar and it's intent", async () => {
  act(async () => {
    const result = render(<PositionsTable rowData={singleRowData} />);
    await waitFor(async () => {
      const cells = screen.getAllByRole('gridcell');
      const cell = cells[3];
      const entryPrice = cell.firstElementChild?.firstElementChild?.textContent;
      const liquidationPrice =
        cell.firstElementChild?.lastElementChild?.textContent;
      const progressBarTrack = cell.lastElementChild;
      const progressBar = progressBarTrack?.firstElementChild as HTMLElement;
      const progressBarWidth = progressBar?.style?.width;
      expect(entryPrice).toEqual('13.3');
      expect(liquidationPrice).toEqual('8.3');
      expect(progressBar.classList.contains('bg-danger')).toEqual(false);
      expect(progressBarWidth).toEqual('20%');
    });
    result.rerender(
      <PositionsTable rowData={[{ ...singleRow, lowMarginLevel: true }]} />
    );
    await waitFor(async () => {
      const cells = screen.getAllByRole('gridcell');
      const cell = cells[3];
      const progressBar = cell.lastElementChild?.firstElementChild;
      expect(progressBar?.classList.contains('bg-danger')).toEqual(true);
    });
  });
});

it('displays leverage', async () => {
  act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
    await waitFor(async () => {
      const cells = screen.getAllByRole('gridcell');
      expect(cells[4].textContent).toEqual('1.1');
    });
  });
});

it('displays allocated margin and margin bar', async () => {
  act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
    await waitFor(async () => {
      const cells = screen.getAllByRole('gridcell');
      const cell = cells[5];
      const capitalUtilisation =
        cell.firstElementChild?.firstElementChild?.textContent;
      const totalBalance =
        cell.firstElementChild?.lastElementChild?.textContent;
      const progressBarTrack = cell.lastElementChild;
      const progressBar = progressBarTrack?.firstElementChild as HTMLElement;
      const progressBarWidth = progressBar?.style?.width;
      expect(capitalUtilisation).toEqual('11.00%');
      expect(totalBalance).toEqual('1,234.56');
      expect(progressBarWidth).toEqual('11%');
    });
  });
});

it('displays realised and unrealised PNL', async () => {
  act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
    await waitFor(async () => {
      const cells = await screen.getAllByRole('gridcell');
      expect(cells[6].textContent).toEqual('1.23');
      expect(cells[7].textContent).toEqual('4.56');
    });
  });
});
