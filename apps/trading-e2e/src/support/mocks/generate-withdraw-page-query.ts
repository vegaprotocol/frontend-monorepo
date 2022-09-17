import type {
  WithdrawFormQuery,
  WithdrawalFieldsFragment,
  WithdrawalAssetFieldsFragment,
  WithdrawalFormAccountFieldsFragment,
} from '@vegaprotocol/withdraws';
import { Schema } from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const generateWithdrawFormQuery = (
  override?: PartialDeep<WithdrawFormQuery>
): WithdrawFormQuery => {
  const withdrawal: WithdrawalFieldsFragment = {
    id: 'withdrawal-0',
    txHash: null,
    status: Schema.WithdrawalStatus.STATUS_FINALIZED,
    amount: '10',
    createdTimestamp: new Date(2020, 1, 30).toISOString(),
    pendingOnForeignChain: false,
    asset: {
      __typename: 'Asset',
      id: 'asset-id',
      symbol: 'tEURO',
      name: 'tEURO',
      status: Schema.AssetStatus.STATUS_ENABLED,
      source: {},
      decimals: 5,
    },
    __typename: 'Withdrawal',
  };
  const account: WithdrawalFormAccountFieldsFragment = {
    type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
    balance: '100000000',
    asset: {
      __typename: 'Asset',
      id: 'asset-0',
      symbol: 'AST0',
    },
    __typename: 'Account',
  };
  const asset1: WithdrawalAssetFieldsFragment = {
    id: 'asset-0',
    symbol: 'AST0',
    name: 'Asset 0',
    decimals: 5,
    status: Schema.AssetStatus.STATUS_ENABLED,
    source: {
      __typename: 'ERC20',
      contractAddress: '0x5E4b9aDA947130Fc320a144cd22bC1641e5c9d81',
    },
    __typename: 'Asset',
  };
  const asset2: WithdrawalAssetFieldsFragment = {
    id: 'asset-1',
    symbol: 'AST1',
    name: 'Asset 1',
    decimals: 5,
    status: Schema.AssetStatus.STATUS_ENABLED,
    source: {
      __typename: 'ERC20',
      contractAddress: '0x444b9aDA947130Fc320a144cd22bC1641e5c9d81',
    },
    __typename: 'Asset',
  };
  const defaultResult: WithdrawFormQuery = {
    party: {
      id: 'party-0',
      withdrawals: [withdrawal],
      accounts: [account],
      __typename: 'Party',
    },
    assetsConnection: {
      __typename: 'AssetsConnection',
      edges: [{ node: asset1 }, { node: asset2 }],
    },
  };

  return merge(defaultResult, override);
};
