import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDateTimeFormat } from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type { Trade } from './fills-data-provider';

import { FillsTable } from './fills-table';
import { generateFill } from './test-helpers';

const waitForGridToBeInTheDOM = () => {
  return waitFor(() => {
    expect(document.querySelector('.ag-root-wrapper')).toBeInTheDocument();
  });
};

// since our grid starts with no data, when the overlay has gone, data has loaded
const waitForDataToHaveLoaded = () => {
  return waitFor(() => {
    expect(document.querySelector('.ag-overlay-no-rows-center')).toBeNull();
  });
};

describe('FillsTable', () => {
  let defaultFill: PartialDeep<Trade>;

  beforeEach(() => {
    defaultFill = {
      price: '100',
      size: '300000',
      market: {
        decimalPlaces: 2,
        positionDecimalPlaces: 5,
        tradableInstrument: {
          instrument: {
            name: 'test market',
            product: {
              settlementAsset: {
                decimals: 2,
                symbol: 'BTC',
              },
            },
          },
        },
      },
      createdAt: new Date('2022-02-02T14:00:00').toISOString(),
    };
  });

  it('correct columns are rendered', async () => {
    await act(async () => {
      render(<FillsTable partyId="party-id" rowData={[generateFill()]} />);
    });
    await waitForGridToBeInTheDOM();
    await waitForDataToHaveLoaded();

    const headers = screen.getAllByRole('columnheader');
    const expectedHeaders = [
      'Market',
      'Size',
      'Price',
      'Notional',
      'Role',
      'Fee',
      'Date',
    ];
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(headers.map((h) => h.textContent?.trim())).toEqual(expectedHeaders);
  });

  it('formats cells correctly for buyer fill', async () => {
    const partyId = 'party-id';
    const buyerFill = generateFill({
      ...defaultFill,
      buyer: {
        id: partyId,
      },
      aggressor: Schema.Side.SIDE_SELL,
      buyerFee: {
        makerFee: '2',
        infrastructureFee: '2',
        liquidityFee: '2',
      },
    });
    await act(async () => {
      render(<FillsTable partyId={partyId} rowData={[{ ...buyerFill }]} />);
    });
    await waitForGridToBeInTheDOM();
    await waitForDataToHaveLoaded();

    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      buyerFill.market?.tradableInstrument.instrument.name || '',
      '+3.00',
      '1.00 BTC',
      '3.00 BTC',
      'Maker',
      '0.06 BTC',
      getDateTimeFormat().format(new Date(buyerFill.createdAt)),
    ];
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });

    const amountCell = cells.find((c) => c.getAttribute('col-id') === 'size');
    expect(amountCell).toHaveClass('text-vega-green');
  });

  it('should format cells correctly for seller fill', async () => {
    const partyId = 'party-id';
    const buyerFill = generateFill({
      ...defaultFill,
      seller: {
        id: partyId,
      },
      aggressor: Schema.Side.SIDE_SELL,
      sellerFee: {
        makerFee: '1',
        infrastructureFee: '1',
        liquidityFee: '1',
      },
    });
    await act(async () => {
      render(<FillsTable partyId={partyId} rowData={[buyerFill]} />);
    });
    await waitForGridToBeInTheDOM();
    await waitForDataToHaveLoaded();

    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      buyerFill.market?.tradableInstrument.instrument.name || '',
      '-3.00',
      '1.00 BTC',
      '3.00 BTC',
      'Taker',
      '0.03 BTC',
      getDateTimeFormat().format(new Date(buyerFill.createdAt)),
    ];
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });

    const amountCell = cells.find((c) => c.getAttribute('col-id') === 'size');
    expect(amountCell).toHaveClass('text-vega-pink');
  });

  it('should render correct maker or taker role', async () => {
    const partyId = 'party-id';
    const takerFill = generateFill({
      seller: {
        id: partyId,
      },
      aggressor: Schema.Side.SIDE_SELL,
    });
    let rerenderer: (ui: React.ReactElement) => void;
    await act(async () => {
      const { rerender } = render(
        <FillsTable partyId={partyId} rowData={[takerFill]} />
      );
      rerenderer = rerender;
    });
    await waitForGridToBeInTheDOM();
    await waitForDataToHaveLoaded();

    expect(
      screen
        .getAllByRole('gridcell')
        .find((c) => c.getAttribute('col-id') === 'aggressor')
    ).toHaveTextContent('Taker');

    const makerFill = generateFill({
      seller: {
        id: partyId,
      },
      aggressor: Schema.Side.SIDE_BUY,
    });
    await act(async () => {
      rerenderer(<FillsTable partyId={partyId} rowData={[makerFill]} />);
    });
    await waitForGridToBeInTheDOM();
    await waitForDataToHaveLoaded();

    expect(
      screen
        .getAllByRole('gridcell')
        .find((c) => c.getAttribute('col-id') === 'aggressor')
    ).toHaveTextContent('Maker');
  });

  it('should render tooltip over fees', async () => {
    const partyId = 'party-id';
    const takerFill = generateFill({
      seller: {
        id: partyId,
      },
      aggressor: Schema.Side.SIDE_SELL,
    });
    await act(async () => {
      render(<FillsTable partyId={partyId} rowData={[takerFill]} />);
    });
    await waitForGridToBeInTheDOM();
    await waitForDataToHaveLoaded();

    const feeCell = screen
      .getAllByRole('gridcell')
      .find(
        (c) =>
          c.getAttribute('col-id') ===
          'market.tradableInstrument.instrument.product'
      );

    await waitFor(() => {
      expect(feeCell).toBeInTheDocument();
    });
    await act(async () => {
      userEvent.hover(feeCell as HTMLElement);
      await new Promise((res) => setTimeout(() => res(true), 1000));
    });

    await act(async () => {
      expect(screen.getByTestId('fee-breakdown-tooltip')).toBeInTheDocument();
    });
  });
});
