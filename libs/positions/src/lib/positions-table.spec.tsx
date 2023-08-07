import type { RenderResult } from '@testing-library/react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PositionsTable, { OpenVolumeCell, PNLCell } from './positions-table';
import type { Position } from './positions-data-providers';
import * as Schema from '@vegaprotocol/types';
import { PositionStatus, PositionStatusMapping } from '@vegaprotocol/types';
import type { ICellRendererParams } from 'ag-grid-community';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

jest.mock('./liquidation-price', () => ({
  LiquidationPrice: () => (
    <span data-testid="liquidation-price">liquidation price</span>
  ),
}));

const singleRow: Position = {
  partyId: 'partyId',
  assetId: 'asset-id',
  assetSymbol: 'BTC',
  averageEntryPrice: '133',
  currentLeverage: 1.1,
  decimals: 2, // this is settlementAsset.decimals
  quantum: '0.1',
  lossSocializationAmount: '0',
  marginAccountBalance: '12345600',
  marketDecimalPlaces: 1,
  marketId: 'string',
  marketName: 'ETH/BTC (31 july 2022)',
  marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
  markPrice: '123',
  notional: '12300',
  openVolume: '100',
  positionDecimalPlaces: 0,
  realisedPNL: '123',
  status: PositionStatus.POSITION_STATUS_UNSPECIFIED,
  totalBalance: '123456',
  unrealisedPNL: '456',
  updatedAt: '2022-07-27T15:02:58.400Z',
};

const singleRowData = [singleRow];

describe('Positions', () => {
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
      'Liquidation price',
      'Settlement asset',
      'Entry price',
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

    expect(cells[2].classList.contains('text-market-green-600')).toBeTruthy();
    expect(cells[2].classList.contains('text-market-red')).toBeFalsy();
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
    expect(cells[2].classList.contains('text-market-green-600')).toBeFalsy();
    expect(cells[2].classList.contains('text-market-red')).toBeTruthy();
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

  it('displays liquidation price', async () => {
    await act(async () => {
      render(<PositionsTable rowData={singleRowData} isReadOnly={false} />);
    });
    const cells = screen.getAllByRole('gridcell');
    expect(cells[4].textContent).toEqual('liquidation price');
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
    // pnl cells should be rendered with asset dps
    const expectedRealised = addDecimalsFormatNumber(
      singleRow.realisedPNL,
      singleRow.decimals
    );
    const expectedUnrealised = addDecimalsFormatNumber(
      singleRow.unrealisedPNL,
      singleRow.decimals
    );

    await act(async () => {
      render(<PositionsTable rowData={singleRowData} isReadOnly={false} />);
    });

    const cells = screen.getAllByRole('gridcell');
    expect(cells[9].textContent).toEqual(expectedRealised);
    expect(cells[10].textContent).toEqual(expectedUnrealised);
  });

  it('displays close button', async () => {
    await act(async () => {
      render(
        <PositionsTable
          rowData={singleRowData}
          pubKey={singleRowData[0].partyId}
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

  describe('PNLCell', () => {
    const props = {
      data: undefined,
      valueFormatted: '100',
    };
    it('renders a dash if no data', () => {
      render(<PNLCell {...(props as ICellRendererParams)} />);
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('renders value if no loss socialisation has occurred', () => {
      const props = {
        data: {
          ...singleRow,
          lossSocialisationAmount: '0',
        },
        valueFormatted: '100',
      };
      render(<PNLCell {...(props as ICellRendererParams)} />);
      expect(screen.getByText(props.valueFormatted)).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('renders value with warning tooltip if loss socialisation occurred', async () => {
      const props = {
        data: {
          ...singleRow,
          lossSocializationAmount: '500',
          decimals: 2,
        },
        valueFormatted: '100',
      };
      render(<PNLCell {...(props as ICellRendererParams)} />);
      const content = screen.getByText(props.valueFormatted);
      expect(content).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();

      await userEvent.hover(content);
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(
        // using within as radix renders tooltip content twice
        within(tooltip).getByText(
          'Lifetime loss socialisation deductions: 5.00'
        )
      ).toBeInTheDocument();
      expect(
        within(tooltip).getByText(
          `You received less BTC in gains that you should have when the market moved in your favour. This occurred because one or more other trader(s) were closed out and did not have enough funds to cover their losses, and the market's insurance pool was empty.`
        )
      ).toBeInTheDocument();
    });
  });

  describe('OpenVolumeCell', () => {
    const props = {
      data: undefined,
      valueFormatted: '100',
    };
    it('renders a dash if no data', () => {
      render(<OpenVolumeCell {...(props as ICellRendererParams)} />);
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('renders value if no status is normal', () => {
      const props = {
        data: {
          ...singleRow,
          status: PositionStatus.POSITION_STATUS_UNSPECIFIED,
        },
        valueFormatted: '100',
      };
      render(<OpenVolumeCell {...(props as ICellRendererParams)} />);
      expect(screen.getByText(props.valueFormatted)).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('renders status with warning tooltip if not normal', async () => {
      const props = {
        data: {
          ...singleRow,
          status: PositionStatus.POSITION_STATUS_ORDERS_CLOSED,
        },
        valueFormatted: '100',
      };
      render(<OpenVolumeCell {...(props as ICellRendererParams)} />);
      const content = screen.getByText(props.valueFormatted);
      expect(content).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();
      await userEvent.hover(content);
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(
        // using within as radix renders tooltip content twice
        within(tooltip).getByText(
          `Status: ${PositionStatusMapping[props.data.status]}`
        )
      ).toBeInTheDocument();
      expect(
        // using within as radix renders tooltip content twice
        within(tooltip).getByText(
          'The position was distressed, but removing open orders from the book brought the margin level back to a point where the open position could be maintained.'
        )
      ).toBeInTheDocument();
    });
  });
});
