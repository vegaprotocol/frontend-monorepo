import { render, screen, waitFor, act } from '@testing-library/react';
import { getDateTimeFormat } from '@vegaprotocol/react-helpers';
import { Side } from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';

import { FillsTable } from './fills-table';
import { generateFill } from './test-helpers';
import type { FillFields } from './__generated__/FillFields';

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
    render(<FillsTable partyId="party-id" rowData={[generateFill()]} />);
    await waitForGridToBeInTheDOM();
    await waitForDataToHaveLoaded();

    await waitFor(() => {
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(7);
      expect(headers.map((h) => h.textContent?.trim())).toEqual([
        'Market',
        'Size',
        'Value',
        'Filled value',
        'Role',
        'Fee',
        'Date',
      ]);
    });
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

    render(<FillsTable partyId={partyId} rowData={[buyerFill]} />);
    await waitForGridToBeInTheDOM();
    await waitForDataToHaveLoaded();

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
    expect(amountCell).toHaveClass('text-vega-green-dark');
  });

  it('should format cells correctly for buyer fill', async () => {
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

    render(<FillsTable partyId={partyId} rowData={[buyerFill]} />);
    await waitForGridToBeInTheDOM();
    await waitForDataToHaveLoaded();

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
    expect(amountCell).toHaveClass('text-vega-green-dark');
  });

  it('should format cells correctly for seller fill', async () => {
    act(async () => {
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

      render(<FillsTable partyId={partyId} rowData={[buyerFill]} />);
      await waitForGridToBeInTheDOM();
      await waitForDataToHaveLoaded();

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
  });

  it('should render correct maker or taker role', async () => {
    act(async () => {
      const partyId = 'party-id';
      const takerFill = generateFill({
        seller: {
          id: partyId,
        },
        aggressor: Side.Sell,
      });

      const { rerender } = render(
        <FillsTable partyId={partyId} rowData={[takerFill]} />
      );
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
        aggressor: Side.Buy,
      });

      rerender(<FillsTable partyId={partyId} rowData={[makerFill]} />);
      await waitForGridToBeInTheDOM();
      await waitForDataToHaveLoaded();

      expect(
        screen
          .getAllByRole('gridcell')
          .find((c) => c.getAttribute('col-id') === 'aggressor')
      ).toHaveTextContent('Maker');
    });
  });
});
