import LiquidityTable from './liquidity-table';
import { act, render, screen, within } from '@testing-library/react';
import * as Schema from '@vegaprotocol/types';
import type { LiquidityProvisionData } from './liquidity-data-provider';
import userEvent from '@testing-library/user-event';

const partyId1 = 'party1';
const partyId2 = 'party2';

const singleRow: LiquidityProvisionData = {
  id: 'lp-single',
  commitmentMinTimeFraction: '100',
  performanceHysteresisEpochs: 4,
  priceRange: '1',
  slaCompetitionFactor: '1',
  partyId: partyId1,
  party: {
    id: partyId1,
  },
  createdAt: '2022-08-19T17:18:36.257028Z',
  updatedAt: '2022-08-19T17:18:36.257028Z',
  commitmentAmount: '100',
  fee: '0.001',
  status: Schema.LiquidityProvisionStatus.STATUS_ACTIVE,
  feeShare: {
    equityLikeShare: '0.5',
    averageEntryValuation: '0.5',
    virtualStake: '0.5',
    averageScore: '0.5',
  },
};

const multiRow: LiquidityProvisionData = {
  id: 'lp-multi',
  commitmentMinTimeFraction: '100',
  performanceHysteresisEpochs: 4,
  priceRange: '1',
  slaCompetitionFactor: '1',
  partyId: partyId2,
  party: {
    id: partyId2,
  },
  createdAt: '2022-08-19T17:18:37.257028Z',
  updatedAt: '2022-08-19T17:18:37.257028Z',
  commitmentAmount: '200',
  fee: '0.002',
  status: Schema.LiquidityProvisionStatus.STATUS_ACTIVE,
  feeShare: {
    equityLikeShare: '0.5',
    averageEntryValuation: '0.5',
    virtualStake: '0.5',
    averageScore: '0.5',
  },
};

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

    const commitmentHeader = headers.find(
      (h) => h.getAttribute('col-id') === 'commitmentAmount'
    );

    if (!commitmentHeader) {
      throw new Error('No commitment header found');
    }

    // 5002-LIQP-003
    expect(commitmentHeader).toHaveAttribute('aria-sort', 'none');
    await userEvent.click(within(commitmentHeader).getByText(/commitment/i));
    expect(commitmentHeader).toHaveAttribute('aria-sort', 'ascending');
  });
});
