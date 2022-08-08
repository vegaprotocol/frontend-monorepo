import type { AccountType } from '@vegaprotocol/types';

export interface Account {
  type: AccountType;
  balance: string;
  asset: {
    id: string;
    symbol: string;
  };
}
