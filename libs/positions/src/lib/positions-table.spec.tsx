import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PositionsTable, OpenVolumeCell, PNLCell } from './positions-table';
import type { Position } from './positions-data-providers';
import * as Schema from '@vegaprotocol/types';
import { PositionStatus } from '@vegaprotocol/types';
import type { ICellRendererParams } from 'ag-grid-community';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { singleRow } from './positions.mock';
import { useLatestTrade } from '@vegaprotocol/trades';
import { type StopOrderFieldsFragment } from '@vegaprotocol/orders';

jest.mock('./liquidation-price', () => ({
  LiquidationPrice: () => (
    <span data-testid="liquidation-price">liquidation price</span>
  ),
}));

describe('Positions', () => {
  const mockClose = jest.fn();
  const mockEditTPSL = jest.fn();
  const renderComponent = async (rowData: Position) => {
    await act(async () => {
      render(
        <PositionsTable
          rowData={[rowData]}
          pubKey={rowData.partyId}
          isReadOnly={false}
          onClose={mockClose}
          onEditTPSL={mockEditTPSL}
        />
      );
    });
  };

  it('should render successfully', async () => {
    await act(async () => {
      const { baseElement } = render(
        <PositionsTable rowData={[]} isReadOnly={false} />
      );
      expect(baseElement).toBeTruthy();
    });
  });

  it('render correct columns', async () => {
    const expectedHeaders = [
      'Market',
      'Size / Notional',
      'Entry / Mark',
      'Margin / Leverage',
      'Liquidation',
      'Realised PNL',
      'Unrealised PNL',
      'Manage TP / SL',
      '',
    ];

    await renderComponent(singleRow);

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(
      headers.map((h) => h.querySelector('[ref="eText"]')?.textContent?.trim())
    ).toEqual(expectedHeaders);
  });

  it('renders market code', async () => {
    await renderComponent(singleRow);
    expect(screen.getByText(singleRow.marketCode)).toBeTruthy();
    expect(screen.getByText('Futr')).toBeInTheDocument();
  });

  it('Does not fail if the market name does not match the split pattern', async () => {
    const breakingMarketName = 'OP/USD AUG-SEP22 - Incentive';
    await renderComponent({ ...singleRow, marketCode: breakingMarketName });
    expect(screen.getByText(breakingMarketName)).toBeTruthy();
  });

  it('displays size / notional correctly for long position', async () => {
    await renderComponent(singleRow);
    const cells = screen.getAllByRole('gridcell');
    const cell = cells[1];

    expect(cell).toHaveClass('text-market-green-600');
    expect(cell).not.toHaveClass('text-market-red');

    expect(within(cell).getByTestId('stack-cell-primary')).toHaveTextContent(
      '+100'
    );
    expect(within(cell).getByTestId('stack-cell-secondary')).toHaveTextContent(
      '1,230.0'
    );
  });

  it('displays size / notional correctly for short position', async () => {
    await renderComponent({ ...singleRow, openVolume: '-100' });
    const cells = screen.getAllByRole('gridcell');
    const cell = cells[1];

    expect(cell).not.toHaveClass('text-market-green-600');
    expect(cell).toHaveClass('text-market-red');

    expect(within(cell).getByTestId('stack-cell-primary')).toHaveTextContent(
      '-100'
    );
    expect(within(cell).getByTestId('stack-cell-secondary')).toHaveTextContent(
      '1,230.0'
    );
  });

  it('displays entry / mark price', async () => {
    await renderComponent(singleRow);
    const cells = screen.getAllByRole('gridcell');
    const cell = within(cells[2]);
    expect(cell.getByTestId('stack-cell-primary')).toHaveTextContent('13.3');
    expect(cell.getByTestId('stack-cell-secondary')).toHaveTextContent('12.3');
  });

  it('does not render entry / mark if market is in opening auction', async () => {
    await renderComponent({
      ...singleRow,
      marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
    });

    const cells = screen.getAllByRole('gridcell');
    expect(cells[2].textContent).toEqual('-');
  });

  it('displays liquidation price', async () => {
    await renderComponent(singleRow);
    const cells = screen.getAllByRole('gridcell');
    expect(cells[4].textContent).toEqual('liquidation price');
  });

  it('do not displays liquidation price if openVolume is 0', async () => {
    await renderComponent({
      ...singleRow,
      openVolume: '0',
    });
    const cells = screen.getAllByRole('gridcell');
    expect(cells[4].textContent).toEqual('-');
  });

  it('displays margin and leverage', async () => {
    await renderComponent(singleRow);
    const cells = screen.getAllByRole('gridcell');

    // margin
    expect(
      within(cells[3]).getByTestId('stack-cell-primary')
    ).toHaveTextContent('123,456.00');

    // leverage
    expect(
      within(cells[3]).getByTestId('stack-cell-secondary')
    ).toHaveTextContent('1.1');
  });

  it('displays realised and unrealised PNL', async () => {
    // pnl cells should be rendered with asset dps
    const expectedRealised = addDecimalsFormatNumber(
      singleRow.realisedPNL,
      singleRow.assetDecimals
    );
    const expectedUnrealised = addDecimalsFormatNumber(
      singleRow.unrealisedPNL,
      singleRow.assetDecimals
    );

    await renderComponent(singleRow);

    const cells = screen.getAllByRole('gridcell');
    expect(cells[5]).toHaveTextContent(expectedRealised);
    expect(cells[6]).toHaveTextContent(expectedUnrealised);
  });

  it('displays close button', async () => {
    await renderComponent(singleRow);
    expect(screen.getByTestId('close-position')).toBeInTheDocument();
  });

  it('do not display close button if openVolume is zero', async () => {
    await renderComponent({ ...singleRow, openVolume: '0' });
    expect(
      screen.queryByRole('button', { name: 'Close' })
    ).not.toBeInTheDocument();
  });

  it('handle negative positionDecimalPlaces', async () => {
    await renderComponent({
      ...singleRow,
      openVolume: '-2000',
      positionDecimalPlaces: -4,
    });
    const cells = screen.getAllByRole('gridcell');
    const cell = cells[1];
    expect(within(cell).getByTestId('stack-cell-primary')).toHaveTextContent(
      '-20,000,000'
    );
  });

  it('renders add button if there are no stop orders', async () => {
    await renderComponent(singleRow);
    expect(screen.getByTestId('edit-tpsl')).toHaveTextContent('Add');
  });

  it('renders edit button if there are stop orders', async () => {
    await renderComponent({
      ...singleRow,
      stopOrders: [{} as StopOrderFieldsFragment],
    });
    expect(screen.getByTestId('edit-tpsl')).toHaveTextContent('Edit');
  });

  it('do not display edit button if openVolume is zero', async () => {
    await renderComponent({ ...singleRow, openVolume: '0' });
    expect(
      screen.queryByRole('button', { name: 'Add' })
    ).not.toBeInTheDocument();
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
      } as ICellRendererParams;
      render(<PNLCell {...props} />);
      expect(
        screen.getByText(props.valueFormatted as string)
      ).toBeInTheDocument();
      expect(screen.queryByTestId(/icon-/)).not.toBeInTheDocument();
    });

    it('renders value with warning icon if loss socialisation occurred', () => {
      const props = {
        data: {
          ...singleRow,
          lossSocializationAmount: '500',
          assetDecimals: 2,
        },
        valueFormatted: '100',
      };
      render(<PNLCell {...(props as ICellRendererParams)} />);
      const content = screen.getByText(props.valueFormatted);
      expect(content).toBeInTheDocument();
      expect(screen.getByTestId(/icon-/)).toBeInTheDocument();
    });
  });

  describe('OpenVolumeCell', () => {
    const props = {
      data: undefined,
      valueFormatted: '100',
    } as ICellRendererParams;

    it('renders a dash if no data', () => {
      render(<OpenVolumeCell {...props} />);
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
      expect(screen.queryByTestId(/icon-/)).not.toBeInTheDocument();
    });

    it('renders status with warning tooltip if position was closed out', async () => {
      (useLatestTrade as jest.Mock).mockReturnValue({
        data: {
          type: 'TYPE_NETWORK_CLOSE_OUT_BAD',
          price: '100',
        },
      });
      const props = {
        data: singleRow,
        valueFormatted: '100',
      } as ICellRendererParams;
      render(<OpenVolumeCell {...props} />);
      const content = screen.getByText(props.valueFormatted as string);
      expect(content).toBeInTheDocument();
      expect(screen.getByTestId(/icon-/)).toBeInTheDocument();
    });
  });

  describe('position status from size column', () => {
    it('does not show if position status is normal', async () => {
      await renderComponent({
        ...singleRow,
        status: PositionStatus.POSITION_STATUS_UNSPECIFIED,
      });
      const cells = screen.getAllByRole('gridcell');
      const cell = cells[1];
      await userEvent.hover(cell);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('renders tooltip when positions has been closed out (liquidated)', async () => {
      (useLatestTrade as jest.Mock).mockReturnValue({
        data: {
          type: 'TYPE_NETWORK_CLOSE_OUT_BAD',
          price: '100',
        },
      });
      await renderComponent(singleRow);
      const cells = screen.getAllByRole('gridcell');
      const cell = cells[1];
      const tooltipTrigger = cell.querySelector('[data-state="closed"]');
      expect(tooltipTrigger).not.toBeNull();
      await userEvent.hover(tooltipTrigger as Element);
      const tooltip = within(await screen.findByRole('tooltip'));
      expect(
        tooltip.getByText('Your position was closed.')
      ).toBeInTheDocument();
    });
  });

  describe('loss socialization from realised pnl column', () => {
    it('renders', async () => {
      await renderComponent({
        ...singleRow,
        lossSocializationAmount: '500',
        assetDecimals: 2,
      });
      const cells = screen.getAllByRole('gridcell');
      const cell = cells[5];
      const tooltipTrigger = cell.querySelector('[data-state="closed"]');
      expect(tooltipTrigger).not.toBeNull();
      await userEvent.hover(tooltipTrigger as Element);
      const tooltip = within(await screen.findByRole('tooltip'));
      expect(tooltip.getByText('Realised PNL: 1.23')).toBeInTheDocument();
      expect(
        tooltip.getByText('Lifetime loss socialisation deductions: 5.00')
      ).toBeInTheDocument();
      expect(
        tooltip.getByText(
          `You received less BTC in gains that you should have when the market moved in your favour. This occurred because one or more other trader(s) were closed out and did not have enough funds to cover their losses, and the market's insurance pool was empty.`
        )
      ).toBeInTheDocument();
    });
  });
});
