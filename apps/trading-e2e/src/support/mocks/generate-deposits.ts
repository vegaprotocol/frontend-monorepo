import merge from 'lodash/merge';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type { DepositsQuery } from '@vegaprotocol/deposits';

export const generateDeposits = (
  override?: PartialDeep<DepositsQuery>
): DepositsQuery => {
  const defaultAccounts: DepositsQuery = {
    __typename: 'Query',
    party: {
      __typename: 'Party',
      id: Cypress.env('VEGA_PUBLIC_KEY'),
      depositsConnection: {
        __typename: 'DepositsConnection',
        edges: [
          {
            __typename: 'DepositEdge',
            node: {
              __typename: 'Deposit',
              id: 'deposit-0',
              status: Schema.DepositStatus.STATUS_OPEN,
              amount: '100000000',
              asset: {
                __typename: 'Asset',
                id: 'asset-0',
                symbol: 'BTC',
                decimals: 8,
              },
              createdTimestamp: '2021-06-01T00:00:00.000Z',
            },
          },
        ],
      },
    },
  };
  return merge(defaultAccounts, override);
};
