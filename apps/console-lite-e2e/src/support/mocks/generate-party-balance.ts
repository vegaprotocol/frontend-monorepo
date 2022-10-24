import merge from 'lodash/merge';
import type { PartyBalanceQuery } from '@vegaprotocol/deal-ticket';
import type { PartialDeep } from 'type-fest';
import { AccountType } from '@vegaprotocol/types';

export const generatePartyBalance = (
  override?: PartialDeep<PartyBalanceQuery>
): PartyBalanceQuery => {
  const defaultResult: PartyBalanceQuery = {
    party: {
      accounts: [
        {
          balance: '88474051',
          type: AccountType.ACCOUNT_TYPE_GENERAL,
          asset: {
            id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
            symbol: 'tDAI',
            name: 'tDAI TEST',
            decimals: 5,
            __typename: 'Asset',
          },
          __typename: 'Account',
        },
        {
          balance: '100000000',
          type: AccountType.ACCOUNT_TYPE_GENERAL,
          asset: {
            id: '8b52d4a3a4b0ffe733cddbc2b67be273816cfeb6ca4c8b339bac03ffba08e4e4',
            symbol: 'tEURO',
            name: 'tEURO TEST',
            decimals: 5,
            __typename: 'Asset',
          },
          __typename: 'Account',
        },
        {
          balance: '3412867',
          type: AccountType.ACCOUNT_TYPE_GENERAL,
          asset: {
            id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
            symbol: 'tDAI',
            name: 'tDAI TEST',
            decimals: 5,
            __typename: 'Asset',
          },
          __typename: 'Account',
        },
        {
          balance: '70007',
          type: AccountType.ACCOUNT_TYPE_GENERAL,
          asset: {
            id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
            symbol: 'tDAI',
            name: 'tDAI TEST',
            decimals: 5,
            __typename: 'Asset',
          },
          __typename: 'Account',
        },
      ],
      __typename: 'Party',
    },
  };

  return merge(defaultResult, override);
};
