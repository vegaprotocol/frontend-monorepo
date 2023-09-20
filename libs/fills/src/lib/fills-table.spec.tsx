import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type { Trade } from './fills-data-provider';
import { FillsTable, getFeesBreakdown } from './fills-table';
import { generateFill } from './test-helpers';

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
            code: 'test market',
            product: {
              __typename: 'Future',
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

    const headers = screen.getAllByRole('columnheader');
    const expectedHeaders = [
      'Market',
      'Size',
      'Price',
      'Notional',
      'Role',
      'Fee',
      'Date',
      '', // action column
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
    render(<FillsTable partyId={partyId} rowData={[{ ...buyerFill }]} />);
    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      buyerFill.market?.tradableInstrument.instrument.code || '',
      '+3.00',
      '1.00 BTC',
      '3.00 BTC',
      'Maker',
      '2.00 BTC',
      getDateTimeFormat().format(new Date(buyerFill.createdAt)),
      '', // action column
    ];
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });

    const amountCell = cells.find((c) => c.getAttribute('col-id') === 'size');
    expect(amountCell).toHaveClass('text-market-green-600');
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
    render(<FillsTable partyId={partyId} rowData={[buyerFill]} />);

    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      buyerFill.market?.tradableInstrument.instrument.code || '',
      '-3.00',
      '1.00 BTC',
      '3.00 BTC',
      'Taker',
      '0.03 BTC',
      getDateTimeFormat().format(new Date(buyerFill.createdAt)),
      '', // action column
    ];
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });

    const amountCell = cells.find((c) => c.getAttribute('col-id') === 'size');
    expect(amountCell).toHaveClass('text-market-red');
  });

  it('should format cells correctly for side unspecified', async () => {
    const partyId = 'party-id';
    const buyerFill = generateFill({
      ...defaultFill,
      seller: {
        id: partyId,
      },
      aggressor: Schema.Side.SIDE_UNSPECIFIED,
      sellerFee: {
        makerFee: '1',
        infrastructureFee: '1',
        liquidityFee: '1',
      },
    });
    render(<FillsTable partyId={partyId} rowData={[buyerFill]} />);

    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      buyerFill.market?.tradableInstrument.instrument.code || '',
      '-3.00',
      '1.00 BTC',
      '3.00 BTC',
      '-',
      '0.03 BTC',
      getDateTimeFormat().format(new Date(buyerFill.createdAt)),
      '', // action column
    ];
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });

    const amountCell = cells.find((c) => c.getAttribute('col-id') === 'size');
    expect(amountCell).toHaveClass('text-market-red');
  });

  it('should render correct maker or taker role', async () => {
    const partyId = 'party-id';
    const takerFill = generateFill({
      seller: {
        id: partyId,
      },
      aggressor: Schema.Side.SIDE_SELL,
    });
    const { rerender } = render(
      <FillsTable partyId={partyId} rowData={[takerFill]} />
    );
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
    rerender(<FillsTable partyId={partyId} rowData={[makerFill]} />);

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
    render(<FillsTable partyId={partyId} rowData={[takerFill]} />);

    const feeCell = screen
      .getAllByRole('gridcell')
      .find(
        (c) =>
          c.getAttribute('col-id') ===
          'market.tradableInstrument.instrument.product'
      );

    expect(feeCell).toBeInTheDocument();
    await userEvent.hover(feeCell as HTMLElement);
    expect(
      await screen.findByTestId('fee-breakdown-tooltip')
    ).toBeInTheDocument();
  });

  it('negative positionDecimalPoints should be properly rendered in size column', async () => {
    const partyId = 'party-id';
    const negativeDecimalPositionFill = generateFill({
      ...defaultFill,
      market: {
        ...defaultFill.market,
        positionDecimalPlaces: -4,
      },
    });
    await act(async () => {
      render(
        <FillsTable partyId={partyId} rowData={[negativeDecimalPositionFill]} />
      );
    });

    const sizeCell = screen
      .getAllByRole('gridcell')
      .find((c) => c.getAttribute('col-id') === 'size');
    expect(sizeCell).toHaveTextContent('3,000,000,000');
  });

  describe('getFeesBreakdown', () => {
    it('should return correct fees breakdown for a taker', () => {
      const fees = {
        makerFee: '1000',
        infrastructureFee: '2000',
        liquidityFee: '3000',
      };
      const expectedBreakdown = {
        infrastructureFee: '2000',
        liquidityFee: '3000',
        makerFee: '1000',
        totalFee: '6000',
      };
      expect(getFeesBreakdown('Taker', fees)).toEqual(expectedBreakdown);
    });

    it('should return correct fees breakdown for a maker', () => {
      const fees = {
        makerFee: '1000',
        infrastructureFee: '2000',
        liquidityFee: '3000',
      };
      const expectedBreakdown = {
        infrastructureFee: '2000',
        liquidityFee: '3000',
        makerFee: '-1000',
        totalFee: '4000',
      };
      expect(getFeesBreakdown('Maker', fees)).toEqual(expectedBreakdown);
    });
  });
});
