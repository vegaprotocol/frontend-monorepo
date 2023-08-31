import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PositionsTable, OpenVolumeCell, PNLCell } from './positions-table';
import type { Position } from './positions-data-providers';
import * as Schema from '@vegaprotocol/types';
import { PositionStatus } from '@vegaprotocol/types';
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
  assetDecimals: 2, // this is settlementAsset.decimals
  quantum: '0.1',
  lossSocializationAmount: '0',
  marginAccountBalance: '12345600',
  marketDecimalPlaces: 1,
  marketId: 'string',
  marketCode: 'ETHBTC.QM21',
  marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
  marketState: Schema.MarketState.STATE_ACTIVE,
  markPrice: '123',
  notional: '12300',
  openVolume: '100',
  positionDecimalPlaces: 0,
  realisedPNL: '123',
  status: PositionStatus.POSITION_STATUS_UNSPECIFIED,
  totalBalance: '123456',
  unrealisedPNL: '456',
  updatedAt: '2022-07-27T15:02:58.400Z',
  productType: 'Future',
};

describe('Positions', () => {
  const renderComponent = async (rowData: Position) => {
    await act(async () => {
      render(<PositionsTable rowData={[rowData]} isReadOnly={false} />);
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
      'Margin',
      'Liquidation',
      'Realised PNL',
      'Unrealised PNL',
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

  it('doesnt render entry / mark if market is in opening auction', async () => {
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
    await act(async () => {
      render(
        <PositionsTable
          rowData={[singleRow]}
          pubKey={singleRow.partyId}
          onClose={() => {
            return;
          }}
          isReadOnly={false}
        />
      );
    });

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

    it('renders status with warning tooltip if orders were closed', () => {
      const props = {
        data: {
          ...singleRow,
          status: PositionStatus.POSITION_STATUS_ORDERS_CLOSED,
        },
        valueFormatted: '100',
      } as ICellRendererParams;
      render(<OpenVolumeCell {...props} />);
      const content = screen.getByText(props.valueFormatted as string);
      expect(content).toBeInTheDocument();
      expect(screen.getByTestId(/icon-/)).toBeInTheDocument();
    });

    it('renders status with warning tooltip if position was closed out', async () => {
      const props = {
        data: {
          ...singleRow,
          status: PositionStatus.POSITION_STATUS_CLOSED_OUT,
        },
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

    it.each([
      {
        status: PositionStatus.POSITION_STATUS_CLOSED_OUT,
        text: 'Your position was closed.',
      },
      {
        status: PositionStatus.POSITION_STATUS_ORDERS_CLOSED,
        text: 'Your open orders were cancelled.',
      },
      {
        status: PositionStatus.POSITION_STATUS_DISTRESSED,
        text: 'Your position is distressed.',
      },
    ])('renders content for $status', async (data) => {
      await renderComponent({
        ...singleRow,
        status: data.status,
      });
      const cells = screen.getAllByRole('gridcell');
      const cell = cells[1];
      await userEvent.hover(cell);
      const tooltip = within(await screen.findByRole('tooltip'));
      expect(tooltip.getByText(data.text)).toBeInTheDocument();
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

      await userEvent.hover(cell);
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
