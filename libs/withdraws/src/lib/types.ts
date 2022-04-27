import type { AccountType } from '@vegaprotocol/types';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  source: {
    contractAddress: string;
  };
}

export interface Account {
  type: AccountType;
  balance: string;
  asset: {
    id: string;
    symbol: string;
  };
}
