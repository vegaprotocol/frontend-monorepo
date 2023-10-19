import LiquidityTable from './liquidity-table';
import { act, render, screen } from '@testing-library/react';
import * as Schema from '@vegaprotocol/types';
import type { LiquidityProvisionData } from './liquidity-data-provider';

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

const singleRowData = [singleRow];

describe('LiquidityTable', () => {
  it('should render successfully', async () => {
    await act(async () => {
      const { baseElement } = render(
        <LiquidityTable rowData={[]} stakeToCcyVolume={'1'} />
      );
      expect(baseElement).toBeTruthy();
    });
  });

  it('should render correct columns', async () => {
    await act(async () => {
      render(
        <LiquidityTable rowData={singleRowData} stakeToCcyVolume={'0.3'} />
      );
    });

    const headers = await screen.getAllByRole('columnheader');

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
      'Commitment ()',
      'Live time fraction on book',
      'Last time fraction on the book',
      'Status',
    ];
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(headerTexts).toEqual(expectedHeaders);
  });
});
