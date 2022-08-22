import { AccountType } from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const generateWithdrawPageQuery = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override?: PartialDeep<any>
) => {
  const defaultResult = {
    party: {
      id: 'party-0',
      withdrawals: [
        {
          id: 'withdrawal-0',
          txHash: null,
          __typename: 'Withdrawal',
        },
      ],
      accounts: [
        {
          type: AccountType.ACCOUNT_TYPE_GENERAL,
          balance: '100000000',
          asset: {
            __typename: 'Asset',
            id: 'asset-0',
            symbol: 'AST0',
          },
          __typename: 'Account',
        },
      ],
      __typename: 'Party',
    },
    assets: [
      {
        id: 'asset-0',
        symbol: 'AST0',
        name: 'Asset 0',
        decimals: 5,
        source: {
          __typename: 'ERC20',
          contractAddress: '0x5E4b9aDA947130Fc320a144cd22bC1641e5c9d81',
        },
        __typename: 'Asset',
      },
      {
        id: 'asset-1',
        symbol: 'AST1',
        name: 'Asset 1',
        decimals: 5,
        source: {
          __typename: 'ERC20',
          contractAddress: '0x444b9aDA947130Fc320a144cd22bC1641e5c9d81',
        },
        __typename: 'Asset',
      },
    ],
  };

  return merge(defaultResult, override);
};
