import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type { Trade } from './fills-data-provider';
import { FeesDiscountBreakdownTooltip, FillsTable } from './fills-table';
import { generateFill } from './test-helpers';

const partyId = 'party-id';
const defaultFill: PartialDeep<Trade> = {
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

describe('FillsTable', () => {
  it('correct columns are rendered', async () => {
    // 7005-FILL-001
    // 7005-FILL-002
    // 7005-FILL-003
    // 7005-FILL-004
    // 7005-FILL-005
    // 7005-FILL-006
    // 7005-FILL-007
    // 7005-FILL-008
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
      'Fee Discount',
      'Date',
      '', // action column
    ];
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(headers.map((h) => h.textContent?.trim())).toEqual(expectedHeaders);
  });

  it('formats cells correctly for buyer fill for maker', async () => {
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
    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      buyerFill.market?.tradableInstrument.instrument.code || '',
      '+3.00',
      '1.00 BTC',
      '3.00 BTC',
      'Maker',
      '2.00 BTC',
      '0.00 BTC',
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

    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      buyerFill.market?.tradableInstrument.instrument.code || '',
      '-3.00',
      '1.00 BTC',
      '3.00 BTC',
      'Taker',
      '0.03 BTC',
      '0.27 BTC',
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
    await act(async () => {
      render(<FillsTable partyId={partyId} rowData={[buyerFill]} />);
    });

    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      buyerFill.market?.tradableInstrument.instrument.code || '',
      '-3.00',
      '1.00 BTC',
      '3.00 BTC',
      '-',
      '0.03 BTC',
      '0.27 BTC',
      getDateTimeFormat().format(new Date(buyerFill.createdAt)),
      '', // action column
    ];
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });

    const amountCell = cells.find((c) => c.getAttribute('col-id') === 'size');
    expect(amountCell).toHaveClass('text-market-red');
  });

  it('should render correct taker role', async () => {
    const takerFill = generateFill({
      seller: {
        id: partyId,
      },
      aggressor: Schema.Side.SIDE_SELL,
    });
    await act(async () => {
      render(<FillsTable partyId={partyId} rowData={[takerFill]} />);
    });
    expect(
      screen
        .getAllByRole('gridcell')
        .find((c) => c.getAttribute('col-id') === 'aggressor')
    ).toHaveTextContent('Taker');
  });

  it('should render correct maker role', async () => {
    const makerFill = generateFill({
      seller: {
        id: partyId,
      },
      aggressor: Schema.Side.SIDE_BUY,
    });
    render(<FillsTable partyId={partyId} rowData={[makerFill]} />);

    expect(
      screen
        .getAllByRole('gridcell')
        .find((c) => c.getAttribute('col-id') === 'aggressor')
    ).toHaveTextContent('Maker');
  });

  it('should render tooltip over fees', async () => {
    const takerFill = generateFill({
      seller: {
        id: partyId,
      },
      aggressor: Schema.Side.SIDE_SELL,
    });
    await act(async () => {
      render(<FillsTable partyId={partyId} rowData={[takerFill]} />);
    });

    const feeCell = screen
      .getAllByRole('gridcell')
      .find((c) => c.getAttribute('col-id') === 'fee');

    expect(feeCell).toBeInTheDocument();
    await userEvent.hover(feeCell as HTMLElement);
    expect(
      await screen.findByTestId('fee-breakdown-tooltip')
    ).toBeInTheDocument();
  });

  it('should render tooltip over fees discounts', async () => {
    const takerFill = generateFill({
      seller: {
        id: partyId,
      },
      aggressor: Schema.Side.SIDE_SELL,
    });
    await act(async () => {
      render(<FillsTable partyId={partyId} rowData={[takerFill]} />);
    });

    const cell = screen
      .getAllByRole('gridcell')
      .find((c) => c.getAttribute('col-id') === 'fee-discount');

    expect(cell).toBeInTheDocument();
    await userEvent.hover(cell as HTMLElement);
    expect(
      await screen.findByTestId('fee-discount-breakdown-tooltip')
    ).toBeInTheDocument();
  });

  it('negative positionDecimalPoints should be properly rendered in size column', async () => {
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

  describe('FeesDiscountBreakdownTooltip', () => {
    it('shows all discounts', () => {
      const data = generateFill({
        ...defaultFill,
        buyer: {
          id: partyId,
        },
      });
      const props = {
        data,
        partyId,
        value: data.market,
      } as Parameters<typeof FeesDiscountBreakdownTooltip>['0'];
      const { container } = render(<FeesDiscountBreakdownTooltip {...props} />);
      const dt = container.querySelectorAll('dt');
      const dd = container.querySelectorAll('dd');
      const expectedDt = [
        'Infrastructure Fee',
        'Referral Discount',
        'Volume Discount',
        'Liquidity Fee',
        'Referral Discount',
        'Volume Discount',
        'Maker Fee',
        'Referral Discount',
        'Volume Discount',
      ];
      const expectedDD = [
        '0.05 BTC',
        '0.06 BTC',
        '0.01 BTC',
        '0.02 BTC',
        '0.03 BTC',
        '0.04 BTC',
      ];
      expectedDt.forEach((label, i) => {
        expect(dt[i]).toHaveTextContent(label);
      });
      expectedDD.forEach((label, i) => {
        expect(dd[i]).toHaveTextContent(label);
      });
    });
  });
});
