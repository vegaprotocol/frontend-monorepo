import * as Schema from '@vegaprotocol/types';
import type {
  WithdrawalEventSubscription,
  WithdrawalFieldsFragment,
  WithdrawalsQuery,
} from './__generated__/Withdrawal';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const withdrawalsQuery = (
  override?: PartialDeep<WithdrawalsQuery>
): WithdrawalsQuery => {
  const defaultResult: WithdrawalsQuery = {
    party: {
      id: 'party-0',
      withdrawalsConnection: {
        __typename: 'WithdrawalsConnection',
        edges: withdrawalFields.map((node) => ({
          __typename: 'WithdrawalEdge',
          node,
          cursor: '1',
        })),
      },
      __typename: 'Party',
    },
  };

  return merge(defaultResult, override);
};

const withdrawalFields: WithdrawalFieldsFragment[] = [
  {
    id: 'withdrawal-0',
    status: Schema.WithdrawalStatus.STATUS_FINALIZED,
    amount: '100',
    txHash: null,
    createdTimestamp: new Date('2022-02-02').toISOString(),
    withdrawnTimestamp: new Date('2022-02-02').toISOString(),
    pendingOnForeignChain: false,
    details: {
      __typename: 'Erc20WithdrawalDetails',
      receiverAddress: '0x72c22822A19D20DE7e426fB84aa047399Ddd8853',
    },
    asset: {
      __typename: 'Asset',
      id: 'asset-0',
      name: 'asset-0 name',
      symbol: 'AST0',
      decimals: 5,
      status: Schema.AssetStatus.STATUS_ENABLED,
      quantum: '1',
      source: {
        __typename: 'ERC20',
        contractAddress: '0x123',
        lifetimeLimit: '1',
        withdrawThreshold: '1',
      },
    },
    party: {
      id: '123',
    },
    __typename: 'Withdrawal',
  },
  {
    id: 'withdrawal-1',
    status: Schema.WithdrawalStatus.STATUS_FINALIZED,
    amount: '100',
    txHash:
      '0x5d7b1a35ba6bd23be17bb7a159c13cdbb3121fceb94e9c6c510f5503dce48d03',
    createdTimestamp: new Date('2022-02-01').toISOString(),
    withdrawnTimestamp: new Date('2022-02-01').toISOString(),
    pendingOnForeignChain: false,
    details: {
      __typename: 'Erc20WithdrawalDetails',
      receiverAddress: '0x72c22822A19D20DE7e426fB84aa047399Ddd8853',
    },
    asset: {
      __typename: 'Asset',
      id: 'asset-0',
      name: 'asset-0 name',
      symbol: 'AST0',
      decimals: 5,
      status: Schema.AssetStatus.STATUS_ENABLED,
      quantum: '1',
      source: {
        __typename: 'ERC20',
        contractAddress: '0x123',
        lifetimeLimit: '1',
        withdrawThreshold: '1',
      },
    },
    party: {
      id: '123',
    },
    __typename: 'Withdrawal',
  },
];

export const withdrawalEventSubscription = (
  override?: PartialDeep<WithdrawalEventSubscription>
): WithdrawalEventSubscription => {
  const defaultResult: WithdrawalEventSubscription = {
    __typename: 'Subscription',
    busEvents: [
      {
        __typename: 'BusEvent',
        event: {
          __typename: 'Withdrawal',
          id: '1234567890',
          status: Schema.WithdrawalStatus.STATUS_FINALIZED,
          amount: '666',
          txHash: null,
          createdTimestamp: new Date().toISOString(),
          withdrawnTimestamp: new Date().toISOString(),
          pendingOnForeignChain: false,
          details: {
            __typename: 'Erc20WithdrawalDetails',
            receiverAddress: '0x72c22822A19D20DE7e426fB84aa047399Ddd8853',
          },
          asset: {
            __typename: 'Asset',
            id: 'asset-0',
            name: 'asset-0 name',
            symbol: 'AST0',
            decimals: 5,
            status: Schema.AssetStatus.STATUS_ENABLED,
            quantum: '1',
            source: {
              __typename: 'ERC20',
              contractAddress: '0x123',
              lifetimeLimit: '1',
              withdrawThreshold: '1',
            },
          },
          party: {
            id: '123',
          },
        },
      },
    ],
  };
  return merge(defaultResult, override);
};
