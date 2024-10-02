import { render, screen } from '@testing-library/react';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import type { PartialDeep } from 'type-fest';
import type { FundingPayment } from './funding-payments-data-provider';
import {
  FundingPaymentsTable,
  type FundingPaymentsTableProps,
} from './funding-payments-table';
import { generateFundingPayment } from './test-helpers';
import { TooltipProvider } from '@vegaprotocol/ui-toolkit';

describe('FundingPaymentsTable', () => {
  let defaultFundingPayment: PartialDeep<FundingPayment>;

  beforeEach(() => {
    defaultFundingPayment = {
      marketId:
        '69abf5c456c20f4d189cea79a11dfd6b0958ead58ab34bd66f73eea48aee600c',
      partyId:
        '02eceaba4df2bef76ea10caf728d8a099a2aa846cced25737cccaa9812342f65',
      fundingPeriodSeq: 84,
      amount: '100',
      timestamp: '2023-10-06T07:06:43.020994Z',
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
    };
  });

  const renderComponent = (props: FundingPaymentsTableProps) => {
    return render(
      <TooltipProvider>
        <FundingPaymentsTable {...props} />
      </TooltipProvider>
    );
  };

  it('correct columns are rendered', async () => {
    renderComponent({ rowData: [generateFundingPayment()] });
    const headers = screen.getAllByRole('columnheader');
    const expectedHeaders = ['Market', 'Amount', 'Date'];
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(headers.map((h) => h.textContent?.trim())).toEqual(expectedHeaders);
  });

  it('formats positive cells', async () => {
    const fundingPayment = generateFundingPayment({
      ...defaultFundingPayment,
    });
    renderComponent({ rowData: [fundingPayment] });
    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      fundingPayment.market?.tradableInstrument.instrument.code || '',
      '1.00 BTC',
      getDateTimeFormat().format(new Date(fundingPayment.timestamp)),
    ];
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });

    const amountCell = cells.find((c) => c.getAttribute('col-id') === 'amount');
    expect(
      amountCell?.querySelector('.ag-cell-value span')?.firstElementChild
    ).toHaveClass('text-dir-up-fg');
  });

  it('formats negative cells', async () => {
    const fundingPayment = generateFundingPayment({
      ...defaultFundingPayment,
      amount: `-${defaultFundingPayment.amount}`,
    });
    renderComponent({ rowData: [fundingPayment] });
    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      fundingPayment.market?.tradableInstrument.instrument.code || '',
      '-1.00 BTC',
      getDateTimeFormat().format(new Date(fundingPayment.timestamp)),
    ];
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });

    const amountCell = cells.find((c) => c.getAttribute('col-id') === 'amount');
    expect(
      amountCell?.querySelector('.ag-cell-value span')?.firstElementChild
    ).toHaveClass('text-dir-down-fg');
  });
});
