import { act, render, screen } from '@testing-library/react';
import { Schema as Types } from '@vegaprotocol/types';
import type { AccountFields } from './accounts-data-provider';
import { getAccountData } from './accounts-data-provider';
import { AccountTable } from './accounts-table';

const singleRow = {
  __typename: 'AccountBalance',
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
  available: '125600000',
  used: '125600000',
  deposited: '125600000',
} as AccountFields;
const singleRowData = [singleRow];

describe('AccountsTable', () => {
  it('should render correct columns', async () => {
    await act(async () => {
      render(
        <AccountTable rowData={singleRowData} onClickAsset={() => null} />
      );
    });
    const expectedHeaders = ['Asset', 'Total', 'Used', '', ''];
    const headers = await screen.findAllByRole('columnheader');
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(
      headers?.map((h) => h.querySelector('[ref="eText"]')?.textContent?.trim())
    ).toEqual(expectedHeaders);
  });

  it('should apply correct formatting', async () => {
    await act(async () => {
      render(
        <AccountTable rowData={singleRowData} onClickAsset={() => null} />
      );
    });
    const cells = await screen.findAllByRole('gridcell');
    const expectedValues = [
      'tBTC',
      '1,256.00000',
      '1,256.00001,256.0000',
      'Breakdown',
      'Deposit',
    ];
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });
  });
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
          deposited: '125600000',
          market: {
            __typename: 'Market',
            id: '10cd0a793ad2887b340940337fa6d97a212e0e517fe8e9eab2b5ef3a38633f35',
            tradableInstrument: {
              __typename: 'TradableInstrument',
              instrument: {
                __typename: 'Instrument',
                name: 'BTCUSD Monthly (30 Jun 2022)',
              },
            },
          },
          type: 'ACCOUNT_TYPE_MARGIN',
          used: '125600000',
        },
      ],
      deposited: '125600000',
      type: 'ACCOUNT_TYPE_GENERAL',
      used: '125600000',
    },
  ];
  expect(result).toEqual(expected);
});
