import type { RenderResult } from '@testing-library/react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PositionsTable, { OpenVolumeCell, PNLCell } from './positions-table';
import type { Position } from './positions-data-providers';
import * as Schema from '@vegaprotocol/types';
import { PositionStatus, PositionStatusMapping } from '@vegaprotocol/types';
import type { ICellRendererParams } from 'ag-grid-community';
import { MemoryRouter } from 'react-router-dom';

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
      <MemoryRouter>
        <PositionsTable rowData={[]} isReadOnly={false} />
      </MemoryRouter>
    );
    expect(baseElement).toBeTruthy();
  });
});

it('render correct columns', async () => {
  await act(async () => {
    render(
      <MemoryRouter>
        <PositionsTable rowData={singleRowData} isReadOnly={true} />
      </MemoryRouter>
    );
  });

  const headers = screen.getAllByRole('columnheader');
  expect(headers).toHaveLength(11);
  expect(
    headers.map((h) => h.querySelector('[ref="eText"]')?.textContent?.trim())
  ).toEqual([
    'Market',
    'Notional',
    'Open volume',
    'Mark price',
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
    render(
      <MemoryRouter>
        <PositionsTable rowData={singleRowData} isReadOnly={false} />
      </MemoryRouter>
    );
  });
  expect(screen.getByText('ETH/BTC (31 july 2022)')).toBeTruthy();
});

it('Does not fail if the market name does not match the split pattern', async () => {
  const breakingMarketName = 'OP/USD AUG-SEP22 - Incentive';
  const row = [
    Object.assign({}, singleRow, { marketName: breakingMarketName }),
  ];
  await act(async () => {
    render(
      <MemoryRouter>
        <PositionsTable rowData={row} isReadOnly={false} />
      </MemoryRouter>
    );
  });

  expect(screen.getByText(breakingMarketName)).toBeTruthy();
});

it('add color and sign to amount, displays positive notional value', async () => {
  let result: RenderResult;
  await act(async () => {
    result = render(
      <MemoryRouter>
        <PositionsTable rowData={singleRowData} isReadOnly={false} />
      </MemoryRouter>
    );
  });
  let cells = screen.getAllByRole('gridcell');

  expect(cells[2].classList.contains('text-vega-green-550')).toBeTruthy();
  expect(cells[2].classList.contains('text-vega-pink')).toBeFalsy();
  expect(cells[2].textContent).toEqual('+100');
  expect(cells[1].textContent).toEqual('1,230.0');
  await act(async () => {
    result.rerender(
      <MemoryRouter>
        <PositionsTable
          rowData={[{ ...singleRow, openVolume: '-100' }]}
          isReadOnly={false}
        />
      </MemoryRouter>
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
      <MemoryRouter>
        <PositionsTable rowData={singleRowData} isReadOnly={false} />
      </MemoryRouter>
    );
  });

  let cells = screen.getAllByRole('gridcell');
  expect(cells[3].textContent).toEqual('12.3');

  await act(async () => {
    result.rerender(
      <MemoryRouter>
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
      </MemoryRouter>
    );
  });

  cells = screen.getAllByRole('gridcell');
  expect(cells[3].textContent).toEqual('-');
});

it('displays leverage', async () => {
  await act(async () => {
    render(
      <MemoryRouter>
        <PositionsTable rowData={singleRowData} isReadOnly={false} />
      </MemoryRouter>
    );
  });
  const cells = screen.getAllByRole('gridcell');
  expect(cells[6].textContent).toEqual('1.1');
});

it('displays allocated margin', async () => {
  await act(async () => {
    render(
      <MemoryRouter>
        <PositionsTable rowData={singleRowData} isReadOnly={false} />
      </MemoryRouter>
    );
  });
  const cells = screen.getAllByRole('gridcell');
  const cell = cells[7];
  expect(cell.textContent).toEqual('123,456.00');
});

it('displays realised and unrealised PNL', async () => {
  await act(async () => {
    render(
      <MemoryRouter>
        <PositionsTable rowData={singleRowData} isReadOnly={false} />
      </MemoryRouter>
    );
  });
  const cells = screen.getAllByRole('gridcell');
  expect(cells[9].textContent).toEqual('4.56');
});

it('displays close button', async () => {
  await act(async () => {
    render(
      <MemoryRouter>
        <PositionsTable
          rowData={singleRowData}
          onClose={() => {
            return;
          }}
          isReadOnly={false}
        />
      </MemoryRouter>
    );
  });
  const cells = screen.getAllByRole('gridcell');
  expect(cells[11].textContent).toEqual('Close');
});

it('do not display close button if openVolume is zero', async () => {
  await act(async () => {
    render(
      <MemoryRouter>
        <PositionsTable
          rowData={[{ ...singleRow, openVolume: '0' }]}
          onClose={() => {
            return;
          }}
          isReadOnly={false}
        />
      </MemoryRouter>
    );
  });
  const cells = screen.getAllByRole('gridcell');
  expect(cells[11].textContent).toEqual('');
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
      within(tooltip).getByText('Lifetime loss socialisation deductions: 5.00')
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
  });
});
