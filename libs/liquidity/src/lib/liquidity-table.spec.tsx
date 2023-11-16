import LiquidityTable from './liquidity-table';
import { act, render, screen } from '@testing-library/react';
import * as Schema from '@vegaprotocol/types';
import type { LiquidityProvisionData } from './liquidity-data-provider';
import userEvent from '@testing-library/user-event';

const singleRow = {
  party: 'a3f762f0a6e998e1d0c6e73017a13ec8a22386c30f7f64a1bdca47330bc592dd',
  createdAt: '2022-08-19T17:18:36.257028Z',
  updatedAt: '2022-08-19T17:18:36.257028Z',
  commitmentAmount: '56298653179',
  fee: '0.001',
  status: Schema.LiquidityProvisionStatus.STATUS_ACTIVE,
  feeShare: {
    equityLikeShare: '0.5',
    averageEntryValuation: '0.5',
  },
  supplied: '67895',
  obligation: '56785',
} as unknown as LiquidityProvisionData;

const multiRow = {
  party: 'a3f762f0a6e998e1d0c6e73017a13ec8a22386c30f7f64a1bdca47330bc592de',
  createdAt: '2022-08-19T17:18:37.257028Z',
  updatedAt: '2022-08-19T17:18:37.257028Z',
  commitmentAmount: '56298653180',
  fee: '0.002',
  status: Schema.LiquidityProvisionStatus.STATUS_PENDING,
  feeShare: {
    equityLikeShare: '0.5',
    averageEntryValuation: '0.5',
  },
  supplied: '67896',
  obligation: '56786',
} as unknown as LiquidityProvisionData;

const singleRowData = [singleRow];
const multiRowData = [singleRow, multiRow];

describe('LiquidityTable', () => {
  it('should render successfully', async () => {
    await act(async () => {
      const { baseElement } = render(
        <LiquidityTable rowData={[]} stakeToCcyVolume={'1'} />
      );
      // 5002-LIQP-002
      // 5002-LIQP-004
      // 5002-LIQP-005
      // 5002-LIQP-011
      expect(baseElement).toBeTruthy();
    });
  });

  it('should render correct columns', async () => {
    await act(async () => {
      render(
        <LiquidityTable rowData={singleRowData} stakeToCcyVolume={'0.3'} />
      );
    });

    const headers = await screen.findAllByRole('columnheader');

    const headerTexts = headers.map((h) =>
      h.querySelector('[ref="eText"]')?.textContent?.trim()
    );
    const expectedHeaders = [
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'Party',
      'Status',
      'Commitment ()',
      'Obligation',
      'Fee',
      'Adjusted stake share',
      'Share',
      'Live supplied liquidity',
      'Fees accrued this epoch',
      'Live time on book',
      'Live liquidity quality score (%)',
      'Last time on the book',
      'Last fee penalty',
      'Last bond penalty',
      'Created',
      'Updated',
    ];
    // 5002-LIQP-001
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(headerTexts).toEqual(expectedHeaders);
  });

  it('should be able to sort', async () => {
    await act(async () => {
      render(
        <LiquidityTable rowData={multiRowData} stakeToCcyVolume={'0.3'} />
      );
    });
    const headers = await screen.findAllByRole('columnheader');
    await userEvent.click(headers[7]);

    const rows = screen.getAllByRole('row');
    // 5002-LIQP-003
    // TODO update test to correctly sort.
    expect(rows[2]).toHaveTextContent(
      '-Active56,298,653,179.0016,889,595,953.700.10%-50.00%-------8/19/2022, 6:18:36 PM8/19/2022, 6:18:36 PM'
    );
    expect(rows[3]).toHaveTextContent(
      '-Pending56,298,653,180.0016,889,595,954.000.20%-50.00%-------8/19/2022, 6:18:37 PM8/19/2022, 6:18:37 PM'
    );
  });
});
