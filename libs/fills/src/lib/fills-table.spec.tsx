import { render, act, screen, waitFor } from '@testing-library/react';
import { getDateTimeFormat } from '@vegaprotocol/react-helpers';
import { Side } from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';

import { FillsTable } from './fills-table';
import { generateFill } from './test-helpers';
import type { FillFields } from './__generated__/FillFields';

describe('FillsTable', () => {
  let defaultFill: PartialDeep<FillFields>;

  beforeEach(() => {
    defaultFill = {
      price: '100',
      size: '300000',
      market: {
        name: 'test market',
        decimalPlaces: 2,
        positionDecimalPlaces: 5,
        tradableInstrument: {
          instrument: {
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
      render(<FillsTable partyId="party-id" fills={[generateFill()]} />);
    });

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(7);
    expect(headers.map((h) => h.textContent?.trim())).toEqual([
      'Market',
      'Amount',
      'Value',
      'Filled value',
      'Role',
      'Fee',
      'Date',
    ]);
  });

  it('formats cells correctly for buyer fill', async () => {
    const partyId = 'party-id';
    const buyerFill = generateFill({
      ...defaultFill,
      buyer: {
        id: partyId,
      },
      aggressor: Side.Sell,
      buyerFee: {
        makerFee: '2',
        infrastructureFee: '2',
        liquidityFee: '2',
      },
    });

    const { container } = render(
      <FillsTable partyId={partyId} fills={[buyerFill]} />
    );

    // Check grid has been rendered
    await waitFor(() => {
      expect(container.querySelector('.ag-root-wrapper')).toBeInTheDocument();
    });

    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      buyerFill.market.name,
      '+3.00000',
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

  it('formats cells correctly for seller fill', async () => {
    const partyId = 'party-id';
    const buyerFill = generateFill({
      ...defaultFill,
      seller: {
        id: partyId,
      },
      aggressor: Side.Sell,
      sellerFee: {
        makerFee: '1',
        infrastructureFee: '1',
        liquidityFee: '1',
      },
    });

    const { container } = render(
      <FillsTable partyId={partyId} fills={[buyerFill]} />
    );

    // Check grid has been rendered
    await waitFor(() => {
      expect(container.querySelector('.ag-root-wrapper')).toBeInTheDocument();
    });

    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      buyerFill.market.name,
      '-3.00000',
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
    expect(amountCell).toHaveClass('text-vega-red');
  });

  it('renders correct maker or taker role', async () => {
    const partyId = 'party-id';
    const takerFill = generateFill({
      seller: {
        id: partyId,
      },
      aggressor: Side.Sell,
    });

    const { container, rerender } = render(
      <FillsTable partyId={partyId} fills={[takerFill]} />
    );

    // Check grid has been rendered
    await waitFor(() => {
      expect(container.querySelector('.ag-root-wrapper')).toBeInTheDocument();
    });

    expect(
      screen
        .getAllByRole('gridcell')
        .find((c) => c.getAttribute('col-id') === 'aggressor')
    ).toHaveTextContent('Taker');

    const makerFill = generateFill({
      seller: {
        id: partyId,
      },
      aggressor: Side.Buy,
    });

    rerender(<FillsTable partyId={partyId} fills={[makerFill]} />);

    expect(
      screen
        .getAllByRole('gridcell')
        .find((c) => c.getAttribute('col-id') === 'aggressor')
    ).toHaveTextContent('Maker');
  });
});
