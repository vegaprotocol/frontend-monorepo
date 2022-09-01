import LiquidityTable from './liquidity-table';
import { act, render, screen, waitFor } from '@testing-library/react';
import { LiquidityProvisionStatus } from '@vegaprotocol/types';
import type { LiquidityProvision } from './liquidity-data-provider';

const singleRow: LiquidityProvision = {
  party: 'a3f762f0a6e998e1d0c6e73017a13ec8a22386c30f7f64a1bdca47330bc592dd',
  createdAt: '2022-08-19T17:18:36.257028Z',
  updatedAt: '2022-08-19T17:18:36.257028Z',
  commitmentAmount: '56298653179',
  fee: '0.001',
  status: LiquidityProvisionStatus.STATUS_ACTIVE,
  equityLikeShare: '0.5',
  averageEntryValuation: '0.5',
  supplied: '67895',
  obligation: '56785',
};

const singleRowData = [singleRow];

describe('LiquidityTable', () => {
  it('should render successfully', async () => {
    await act(async () => {
      const { baseElement } = render(<LiquidityTable data={[]} />);
      expect(baseElement).toBeTruthy();
    });
  });

  it('should render correct columns', async () => {
    act(async () => {
      render(<LiquidityTable data={singleRowData} />);
      await waitFor(async () => {
        const headers = await screen.getAllByRole('columnheader');
        expect(headers).toHaveLength(9);
        expect(
          headers.map((h) =>
            h.querySelector('[ref="eText"]')?.textContent?.trim()
          )
        ).toEqual([
          'Party',
          'Average entry valuation',
          'Updated',
          'Created',
          'Supplied (siskas)',
          'Obligation (siskas)',
          'Share',
          'Fee',
          'Status',
        ]);
      });
    });
  });
});
