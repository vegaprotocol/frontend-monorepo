import type { AccountType } from '@vegaprotocol/types';

interface ERC20AssetSource {
  __typename: 'ERC20';
  contractAddress: string;
}

interface BuiltinAssetSource {
  __typename: 'BuiltinAsset';
}

type AssetSource = ERC20AssetSource | BuiltinAssetSource;

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  source: AssetSource;
}

export interface Account {
  type: AccountType;
  balance: string;
  asset: {
    id: string;
    symbol: string;
  };
}
