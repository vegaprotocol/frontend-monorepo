import BreakdownTable from './breakdown-table';
import { act, render, screen, waitFor } from '@testing-library/react';
import { Schema as Types } from '@vegaprotocol/types';
import type { AccountFields } from './accounts-data-provider';
import { getAccountData } from './accounts-data-provider';

const singleRow: AccountFields = {
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
  available: '125600000',
  used: '125600000',
  deposited: '125600000',
};
const singleRowData = [singleRow];

describe('BreakdownTable', () => {
  it('should render successfully', async () => {
    await act(async () => {
      const { baseElement } = render(<BreakdownTable data={[]} />);
      expect(baseElement).toBeTruthy();
    });
  });

  it('should render correct columns', async () => {
    act(async () => {
      render(<BreakdownTable data={singleRowData} />);
      await waitFor(async () => {
        const headers = await screen.getAllByRole('columnheader');
        expect(headers).toHaveLength(3);
        expect(
          headers.map((h) =>
            h.querySelector('[ref="eText"]')?.textContent?.trim()
          )
        ).toEqual(['Market', 'Used', 'Type']);
      });
    });
  });

  it('should apply correct formatting', async () => {
    act(async () => {
      render(<BreakdownTable data={singleRowData} />);
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
        available: '-125600000',
        balance: '-125600000',
        breakdown: [
          {
            __typename: 'Account',
            asset: {
              __typename: 'Asset',
              decimals: 5,
              id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
              symbol: 'tBTC',
            },
            available: '-125600000',
            balance: '125600000',
            deposited: '0',
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
        deposited: '0',
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
        type: 'ACCOUNT_TYPE_GENERAL',
        used: '125600000',
      },
    ];
    expect(result).toEqual(expected);
  });
});
