import * as Schema from '@vegaprotocol/types';
import { useMemo } from 'react';
import type { AccountFragment as Account } from './__generated__/PartyBalance';

export const useSettlementAccount = (
  settlementAssetId: string,
  accounts: Account[],
  type?: Schema.AccountType
): Account | null => {
  const callback = () =>
    accounts.find((account) => {
      if (type) {
        return account.asset.id === settlementAssetId && account.type === type;
      }

      return account.asset.id === settlementAssetId;
    });
  const account = useMemo(callback, [accounts, settlementAssetId, type]);
  return account || null;
};
