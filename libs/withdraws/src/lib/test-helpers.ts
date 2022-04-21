import { AccountType } from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { Asset, Account } from './types';

export const generateAsset = (override?: Partial<Asset>) => {
  const defaultAsset: Asset = {
    id: 'asset-id',
    symbol: 'asset-symbol',
    name: 'asset-name',
    decimals: 5,
    source: {
      contractAddress: 'contract-address',
    },
  };
  return merge(defaultAsset, override);
};

export const generateAccount = (override?: Partial<Account>) => {
  const defaultAccount: Account = {
    type: AccountType.General,
    balance: '100000',
    asset: {
      id: 'asset-id',
      symbol: 'asset-symbol',
    },
  };
  return merge(defaultAccount, override);
};
