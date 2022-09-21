import AccountsTable from './accounts-table';
import { act, render, screen, waitFor } from '@testing-library/react';
import type { AccountFieldsFragment } from './__generated___/Accounts';
import { Schema as Types } from '@vegaprotocol/types';

const singleRow: AccountFieldsFragment = {
  __typename: 'Account',
  type: Types.AccountType.ACCOUNT_TYPE_MARGIN,
  balance: '125600000',
  market: {
    __typename: 'Market',
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        __typename: 'Instrument',
        name: 'BTCUSD Monthly (30 Jun 2022)',
      },
    },
    id: '10cd0a793ad2887b340940337fa6d97a212e0e517fe8e9eab2b5ef3a38633f35',
  },
  asset: {
    __typename: 'Asset',
    id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
    symbol: 'tBTC',
    decimals: 5,
  },
};
const singleRowData = [singleRow];

describe('AccountsTable', () => {
  it('should render successfully', async () => {
    await act(async () => {
      const { baseElement } = render(<AccountsTable data={[]} />);
      expect(baseElement).toBeTruthy();
    });
  });

  it('should render correct columns', async () => {
    act(async () => {
      render(<AccountsTable data={singleRowData} />);
      await waitFor(async () => {
        const headers = await screen.getAllByRole('columnheader');
        expect(headers).toHaveLength(4);
        expect(
          headers.map((h) =>
            h.querySelector('[ref="eText"]')?.textContent?.trim()
          )
        ).toEqual(['Asset', 'Type', 'Market', 'Balance']);
      });
    });
  });

  it('should apply correct formatting', async () => {
    act(async () => {
      render(<AccountsTable data={singleRowData} />);
      await waitFor(async () => {
        const cells = await screen.getAllByRole('gridcell');
        const expectedValues = [
          'tBTC',
          singleRow.type,
          'BTCUSD Monthly (30 Jun 2022)',
          '1,256.00000',
        ];
        cells.forEach((cell, i) => {
          expect(cell).toHaveTextContent(expectedValues[i]);
        });
      });
    });
  });
});
