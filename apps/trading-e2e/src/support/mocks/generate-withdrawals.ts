import { Schema } from '@vegaprotocol/types';
import type { WithdrawalsQuery } from '@vegaprotocol/withdraws';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const generateWithdrawals = (override?: PartialDeep<WithdrawalsQuery>) => {
  const defaultResult: WithdrawalsQuery = {
    party: {
      id: 'party-0',
      withdrawalsConnection: {
        __typename: 'WithdrawalsConnection',
        edges: [
          {
            __typename: 'WithdrawalEdge',
            node: {
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
                source: {
                  __typename: 'ERC20',
                  contractAddress: '0x123',
                },
              },
              __typename: 'Withdrawal',
            },
          },
          {
            __typename: 'WithdrawalEdge',
            node: {
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
                source: {
                  __typename: 'ERC20',
                  contractAddress: '0x123',
                },
              },
              __typename: 'Withdrawal',
            },
          },
        ],
      },
      __typename: 'Party',
    },
  };

  return merge(defaultResult, override);
};
