import { WithdrawalStatus } from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const generateWithdrawals = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override?: PartialDeep<any>
) => {
  const defaultResult = {
    party: {
      id: 'party-0',
      withdrawals: [
        {
          id: 'withdrawal-0',
          status: WithdrawalStatus.STATUS_FINALIZED,
          amount: '100',
          txHash: null,
          createdTimestamp: new Date('2022-02-02').toISOString(),
          withdrawnTimestamp: new Date('2022-02-02').toISOString(),
          details: {
            __typename: 'Erc20WithdrawalDetails',
            receiverAddress: '0x72c22822A19D20DE7e426fB84aa047399Ddd8853',
          },
          asset: {
            __typename: 'Asset',
            id: 'asset-0',
            symbol: 'AST0',
            decimals: 5,
          },
          __typename: 'Withdrawal',
        },
        {
          id: 'withdrawal-1',
          status: WithdrawalStatus.STATUS_FINALIZED,
          amount: '100',
          txHash:
            '0x5d7b1a35ba6bd23be17bb7a159c13cdbb3121fceb94e9c6c510f5503dce48d03',
          createdTimestamp: new Date('2022-02-01').toISOString(),
          withdrawnTimestamp: new Date('2022-02-01').toISOString(),
          details: {
            __typename: 'Erc20WithdrawalDetails',
            receiverAddress: '0x72c22822A19D20DE7e426fB84aa047399Ddd8853',
          },
          asset: {
            __typename: 'Asset',
            id: 'asset-0',
            symbol: 'AST0',
            decimals: 5,
          },
          __typename: 'Withdrawal',
        },
      ],
      __typename: 'Party',
    },
  };

  return merge(defaultResult, override);
};
