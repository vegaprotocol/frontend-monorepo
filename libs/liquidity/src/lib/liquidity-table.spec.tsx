import LiquidityTable from './liquidity-table';
import { act, render, screen, waitFor } from '@testing-library/react';
import type { Liquidity_market_liquidityProvisionsConnection_edges } from './__generated__';
import { AccountType, LiquidityProvisionStatus } from '@vegaprotocol/types';

const singleRow: Liquidity_market_liquidityProvisionsConnection_edges = {
  __typename: 'LiquidityProvisionsEdge',
  node: {
    __typename: 'LiquidityProvision',
    id: 'bd0f994aeb8a6ee8d60def2076894cb3778548a8398b4495c21e31ee0ce7828e',
    party: {
      __typename: 'Party',
      id: 'a3f762f0a6e998e1d0c6e73017a13ec8a22386c30f7f64a1bdca47330bc592dd',
      accountsConnection: {
        __typename: 'AccountsConnection',
        edges: [
          {
            __typename: 'AccountEdge',
            node: {
              __typename: 'Account',
              type: AccountType.ACCOUNT_TYPE_MARGIN,
              balance: '3705237295',
            },
          },
          {
            __typename: 'AccountEdge',
            node: {
              __typename: 'Account',
              type: AccountType.ACCOUNT_TYPE_BOND,
              balance: '51672489792',
            },
          },
          {
            __typename: 'AccountEdge',
            node: {
              __typename: 'Account',
              type: AccountType.ACCOUNT_TYPE_MARGIN,
              balance: '4033215062',
            },
          },
          {
            __typename: 'AccountEdge',
            node: {
              __typename: 'Account',
              type: AccountType.ACCOUNT_TYPE_BOND,
              balance: '56298653179',
            },
          },
          {
            __typename: 'AccountEdge',
            node: {
              __typename: 'Account',
              type: AccountType.ACCOUNT_TYPE_GENERAL,
              balance: '464366111910',
            },
          },
        ],
      },
    },
    createdAt: '2022-08-19T17:18:36.257028Z',
    updatedAt: '2022-08-19T17:18:36.257028Z',
    commitmentAmount: '56298653179',
    fee: '0.001',
    status: LiquidityProvisionStatus.STATUS_ACTIVE,
  },
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
        expect(headers).toHaveLength(4);
        expect(
          headers.map((h) =>
            h.querySelector('[ref="eText"]')?.textContent?.trim()
          )
        ).toEqual(['Party', 'Average entry valuation', 'Updated', 'Created']);
      });
    });
  });

  // it('should apply correct formatting', async () => {
  //   act(async () => {
  //     render(<LiquidityTable data={singleRowData} />);
  //     await waitFor(async () => {
  //       const cells = await screen.getAllByRole('gridcell');
  //       const expectedValues = [
  //         'tBTC',
  //         'BTCUSD Monthly (30 Jun 2022)',
  //         '1,256.00000',
  //       ];
  //       cells.forEach((cell, i) => {
  //         expect(cell).toHaveTextContent(expectedValues[i]);
  //       });
  //     });
  //   });
  // });
});
