import type { Asset } from '@vegaprotocol/assets';
import * as Schema from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { AccountFieldsFragment } from '@vegaprotocol/accounts';
import type { WithdrawalFieldsFragment } from './__generated__/Withdrawal';

export const generateAsset = (override?: PartialDeep<Asset>) => {
  const defaultAsset: Asset = {
    id: 'asset-id',
    symbol: 'asset-symbol',
    name: 'asset-name',
    quantum: '',
    decimals: 5,
    status: Schema.AssetStatus.STATUS_ENABLED,
    source: {
      contractAddress: 'contract-address',
      lifetimeLimit: '123000000',
      withdrawThreshold: '50',
      __typename: 'ERC20',
    },
    infrastructureFeeAccount: {
      balance: '1',
      __typename: 'AccountBalance',
    },
    globalRewardPoolAccount: {
      balance: '2',
      __typename: 'AccountBalance',
    },
    takerFeeRewardAccount: {
      balance: '3',
      __typename: 'AccountBalance',
    },
    makerFeeRewardAccount: {
      balance: '4',
      __typename: 'AccountBalance',
    },
    lpFeeRewardAccount: {
      balance: '5',
      __typename: 'AccountBalance',
    },
    marketProposerRewardAccount: {
      balance: '6',
      __typename: 'AccountBalance',
    },
    __typename: 'Asset',
  };
  return merge(defaultAsset, override);
};

export const generateAccount = (
  override?: PartialDeep<AccountFieldsFragment>
) => {
  const defaultAccount: AccountFieldsFragment = {
    type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
    balance: '100000',
    asset: {
      id: 'asset-id',
    },
  };
  return merge(defaultAccount, override);
};

export const generateWithdrawal = (
  override?: PartialDeep<WithdrawalFieldsFragment>
): WithdrawalFieldsFragment => {
  return merge(
    {
      __typename: 'Withdrawal',
      id: 'withdrawal-id',
      status: Schema.WithdrawalStatus.STATUS_OPEN,
      amount: '100',
      asset: {
        __typename: 'Asset',
        name: 'asset-name',
        id: 'asset-id',
        symbol: 'asset-symbol',
        decimals: 2,
        status: Schema.AssetStatus.STATUS_ENABLED,
        source: {
          __typename: 'ERC20',
          contractAddress: '0x123',
        },
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
