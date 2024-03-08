import type { Exact } from 'type-fest';
import { type Transfer } from '@vegaprotocol/wallet';
import { removeDecimal } from '@vegaprotocol/utils';
import { type AccountType } from '@vegaprotocol/types';

export const normalizeTransfer = <T extends Exact<Transfer, T>>(
  address: string,
  amount: string,
  fromAccountType: AccountType,
  toAccountType: AccountType,
  asset: {
    id: string;
    decimals: number;
  }
): Transfer => {
  return {
    to: address,
    fromAccountType,
    toAccountType,
    asset: asset.id,
    amount: removeDecimal(amount, asset.decimals),
    // oneOff or recurring required otherwise wallet will error
    // default oneOff is immediate transfer
    oneOff: {},
  };
};
