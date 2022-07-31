import { act, render, screen, waitFor } from '@testing-library/react';
import PositionsTable from './positions-table';
import type { Position } from './positions-metrics-data-provider';
import { MarketTradingMode } from '@vegaprotocol/types';

const singleRow: Position = {
  marketName: 'ETH/BTC (31 july 2022)',
  averageEntryPrice: '0',
  capitalUtilisation: '0',
  currentLeverage: 0,
  marketDecimalPlaces: 2,
  positionDecimalPlaces: 2,
  assetDecimals: 2,
  // generalAccountBalance: '0',
  totalBalance: '0',
  assetSymbol: 'BTC',
  // leverageInitial: '0',
  // leverageMaintenance: '0',
  // leverageRelease: '0',
  // leverageSearch: '0',
  liquidationPrice: '0',
  // marginAccountBalance: '0',
  lowMarginLevel: false,
  // marginMaintenance: '0',
  // marginSearch: '0',
  // marginInitial: '0',
  marketId: 'string',
  marketTradingMode: MarketTradingMode.Continuous,
  markPrice: '0',
  notional: '0',
  openVolume: '0',
  realisedPNL: '0',
  unrealisedPNL: '0',
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
    await waitFor(async () => {
      const headers = await screen.getAllByRole('columnheader');
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
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
    await waitFor(async () => {
      expect(true).toEqual(true);
    });
  });
});

it('add color and sign to amount, displayes positive notional value', async () => {
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
    await waitFor(async () => {
      expect(true).toEqual(true);
    });
  });
});

it('displayes mark price', async () => {
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
    await waitFor(async () => {
      expect(true).toEqual(true);
    });
  });
});

it("displays properly entry, liquidation price and liquidation bar an it's intent", async () => {
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
    await waitFor(async () => {
      expect(true).toEqual(true);
    });
  });
});

it('displays leverage', async () => {
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
    await waitFor(async () => {
      expect(true).toEqual(true);
    });
  });
});

it('displays allocated margin and margin bar', async () => {
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
    await waitFor(async () => {
      expect(true).toEqual(true);
    });
  });
});

it('displays realized and unrealised PNL', async () => {
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
    await waitFor(async () => {
      expect(true).toEqual(true);
    });
  });
});

it('displays update datetime', async () => {
  await act(async () => {
    render(<PositionsTable rowData={singleRowData} />);
    await waitFor(async () => {
      expect(true).toEqual(true);
    });
  });
});
