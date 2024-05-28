import merge from 'lodash/merge';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type {
  DepositEventSubscription,
  DepositFieldsFragment,
  DepositsQuery,
} from './__generated__/Deposit';

export const depositsQuery = (
  override?: PartialDeep<DepositsQuery>
): DepositsQuery => {
  const defaultAccounts: DepositsQuery = {
    __typename: 'Query',
    party: {
      __typename: 'Party',
      id: 'vega-0', //use override to change it to VEGA PUBLIC KEY
      depositsConnection: {
        __typename: 'DepositsConnection',
        edges: depositFields.map((node) => ({
          __typename: 'DepositEdge',
          node,
          cursor: '1',
        })),
      },
    },
  };
  return merge(defaultAccounts, override);
};

const depositFields: DepositFieldsFragment[] = [
  {
    __typename: 'Deposit',
    id: 'deposit-0',
    status: Schema.DepositStatus.STATUS_OPEN,
    amount: '100000000',
    asset: {
      __typename: 'Asset',
      id: 'asset-0',
      name: 'Asset 0',
      symbol: 'BTC',
      decimals: 8,
      quantum: '1',
      status: Schema.AssetStatus.STATUS_ENABLED,
      source: {
        __typename: 'ERC20',
        contractAddress: '0x123',
        lifetimeLimit: '1',
        withdrawThreshold: '1',
        chainId: '1',
      },
    },
    party: {
      id: 'party-id',
    },
    createdTimestamp: '2021-06-01T00:00:00.000Z',
  },
];

export const depositEventSubscription = (
  override?: PartialDeep<DepositEventSubscription>
): DepositEventSubscription => {
  const defaultResult: DepositEventSubscription = {
    __typename: 'Subscription',
    busEvents: depositFields.map((event) => ({
      __typename: 'BusEvent',
      event,
    })),
  };
  return merge(defaultResult, override);
};
