import type { Schema } from '@vegaprotocol/types';

export interface Account {
  type: Schema.AccountType;
  balance: string;
  asset: {
    id: string;
    symbol: string;
  };
}
