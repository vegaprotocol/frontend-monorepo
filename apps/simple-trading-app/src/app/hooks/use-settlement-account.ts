import type { PartyBalanceQuery_party_accounts } from '../components/deal-ticket/__generated__/PartyBalanceQuery';
import { useMemo } from 'react';

export const useSettlementAccount = (
  settlementAssetId: string,
  accounts: PartyBalanceQuery_party_accounts[] | null
): PartyBalanceQuery_party_accounts | null => {
  const callback = () =>
    accounts?.length
      ? accounts.find((account) => {
          return account.asset.id === settlementAssetId;
        })
      : null;
  const account = useMemo(callback, [accounts, settlementAssetId]);
  return account as PartyBalanceQuery_party_accounts;
};
