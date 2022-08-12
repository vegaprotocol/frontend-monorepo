import type { PartyBalanceQuery_party_accounts } from '../components/deal-ticket/__generated__/PartyBalanceQuery';
import type { AccountType } from '@vegaprotocol/types';
import { useMemo } from 'react';

export const useSettlementAccount = (
  settlementAssetId: string,
  accounts: PartyBalanceQuery_party_accounts[],
  type?: AccountType
): PartyBalanceQuery_party_accounts | null => {
  const callback = () =>
    accounts.find((account) => {
      if (type) {
        return account.asset.id === settlementAssetId && account.type === type;
      }

      return account.asset.id === settlementAssetId;
    });
  const account = useMemo(callback, [accounts, settlementAssetId, type]);
  return account as PartyBalanceQuery_party_accounts;
};
