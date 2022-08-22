import type { Asset } from '@vegaprotocol/react-helpers';
import { AccountType, WithdrawalStatus } from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { Account } from './types';
import type { Withdrawals_party_withdrawals } from './__generated__/Withdrawals';

export const generateAsset = (override?: PartialDeep<Asset>) => {
  const defaultAsset: Asset = {
    __typename: 'Asset',
    id: 'asset-id',
    symbol: 'asset-symbol',
    name: 'asset-name',
    decimals: 5,
    source: {
      __typename: 'ERC20',
      contractAddress: 'contract-address',
    },
  };
  return merge(defaultAsset, override);
};

export const generateAccount = (override?: PartialDeep<Account>) => {
  const defaultAccount: Account = {
    type: AccountType.ACCOUNT_TYPE_GENERAL,
    balance: '100000',
    asset: {
      id: 'asset-id',
      symbol: 'asset-symbol',
    },
  };
  return merge(defaultAccount, override);
};

export const generateWithdrawal = (
  override?: PartialDeep<Withdrawals_party_withdrawals>
): Withdrawals_party_withdrawals => {
  return merge(
    {
      __typename: 'Withdrawal',
      id: 'withdrawal-id',
      status: WithdrawalStatus.STATUS_OPEN,
      amount: '100',
      asset: {
        __typename: 'Asset',
        id: 'asset-id',
        symbol: 'asset-symbol',
        decimals: 2,
      },
      createdTimestamp: '2022-04-20T00:00:00',
      withdrawnTimestamp: null,
      txHash: null,
      details: {
        __typename: 'Erc20WithdrawalDetails',
        receiverAddress: '123456___123456',
      },
      pendingOnForeignChain: false,
    },
    override
  );
};
