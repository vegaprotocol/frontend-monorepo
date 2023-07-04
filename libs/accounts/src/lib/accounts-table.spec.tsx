import { act, render, screen } from '@testing-library/react';
import * as Types from '@vegaprotocol/types';
import type { AccountFields } from './accounts-data-provider';
import { getAccountData } from './accounts-data-provider';
import { AccountTable } from './accounts-table';

const singleRow = {
  __typename: 'AccountBalance',
  type: Types.AccountType.ACCOUNT_TYPE_MARGIN,
  balance: '125600000',
  market: {
    __typename: 'Market',
    id: '10cd0a793ad2887b340940337fa6d97a212e0e517fe8e9eab2b5ef3a38633f35',
  },
  asset: {
    __typename: 'Asset',
    id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
    symbol: 'tBTC',
    decimals: 5,
  },
  available: '125600000',
  used: '125600000',
  total: '251200000',
} as AccountFields;
const singleRowData = [singleRow];

describe('AccountsTable', () => {
  it('should render correct columns', async () => {
    await act(async () => {
      render(
        <AccountTable
          rowData={singleRowData}
          onClickAsset={() => null}
          isReadOnly={false}
        />
      );
    });
    const expectedHeaders = ['Asset', 'Used', 'Available', 'Total', ''];
    const headers = await screen.findAllByRole('columnheader');
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(
      headers?.map((h) => h.querySelector('[ref="eText"]')?.textContent?.trim())
    ).toEqual(expectedHeaders);
  });

  it('should apply correct formatting', async () => {
    const { container } = render(
      <AccountTable
        rowData={singleRowData}
        onClickAsset={() => null}
        isReadOnly={false}
      />
    );

    const cells = await screen.findAllByRole('gridcell');
    const expectedValues = ['tBTC', '1,256.00', '1,256.00', '2,512.00', ''];
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });
    const rows = container.querySelector('.ag-center-cols-container');
    expect(rows?.childElementCount).toBe(1);
  });

  it('should apply correct formatting in view as user mode', async () => {
    const { container } = render(
      <AccountTable
        rowData={singleRowData}
        onClickAsset={() => null}
        isReadOnly={true}
      />
    );

    const cells = await screen.findAllByRole('gridcell');
    const expectedValues = ['tBTC', '1,256.00', '1,256.00', '2,512.00', ''];
    expect(cells.length).toBe(expectedValues.length);
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });
    const rows = container.querySelector('.ag-center-cols-container');
    expect(rows?.childElementCount).toBe(1);
  });

  it('should add asset as pinned', async () => {
    const { container, rerender } = render(
      <AccountTable
        rowData={singleRowData}
        onClickAsset={() => null}
        isReadOnly={false}
        pinnedAsset={{
          decimals: 5,
          id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
          symbol: 'tBTC',
          name: 'tBTC',
        }}
      />
    );
    await screen.findAllByRole('rowgroup');
    let rows = container.querySelector('.ag-center-cols-container');
    expect(rows?.childElementCount).toBe(0);
    let pinnedRows = container.querySelector('.ag-floating-top-container');
    expect(pinnedRows?.childElementCount ?? 0).toBe(1);

    rerender(
      <AccountTable
        rowData={singleRowData}
        onClickAsset={() => null}
        isReadOnly={false}
        pinnedAsset={{
          decimals: 5,
          id: '',
          symbol: 'tBTC',
          name: 'tBTC',
        }}
      />
    );
    rows = container.querySelector('.ag-center-cols-container');
    expect(rows?.childElementCount ?? 0).toBe(1);
    pinnedRows = container.querySelector('.ag-floating-top-container');
    expect(pinnedRows?.childElementCount ?? 0).toBe(1);
  });

  it('should get correct account data', () => {
    const result = getAccountData([singleRow]);
    const expected = [
      {
        asset: {
          __typename: 'Asset',
          decimals: 5,
          id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
          symbol: 'tBTC',
        },
        available: '0',
        balance: '0',
        breakdown: [
          {
            __typename: 'AccountBalance',
            asset: {
              __typename: 'Asset',
              decimals: 5,
              id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
              symbol: 'tBTC',
            },
            available: '0',
            balance: '125600000',
            total: '125600000',
            market: {
              __typename: 'Market',
              id: '10cd0a793ad2887b340940337fa6d97a212e0e517fe8e9eab2b5ef3a38633f35',
            },
            type: 'ACCOUNT_TYPE_MARGIN',
            used: '125600000',
          },
        ],
        total: '125600000',
        type: 'ACCOUNT_TYPE_GENERAL',
        used: '125600000',
      },
    ];
    expect(result).toEqual(expected);
  });
});
