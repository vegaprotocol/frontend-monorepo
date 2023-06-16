import { useCallback, useMemo, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { accountsDataProvider } from './accounts-data-provider';
import type { Account } from './accounts-data-provider';
import { getMarketAccount } from './get-market-account';

export const useMarketAccountBalance = (marketId: string) => {
  const { pubKey } = useVegaWallet();
  const [accountBalance, setAccountBalance] = useState<string>('');
  const [accountDecimals, setAccountDecimals] = useState<number | null>(null);
  const update = useCallback(
    ({ data }: { data: Account[] | null }) => {
      const account = getMarketAccount({ accounts: data, marketId });
      if (account?.balance) {
        setAccountBalance(account?.balance || '');
      }
      if (account?.asset.decimals) {
        setAccountDecimals(account?.asset.decimals || null);
      }
      return true;
    },
    [marketId]
  );
  useDataProvider({
    dataProvider: accountsDataProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey || !marketId,
    update,
  });

  return useMemo(
    () => ({
      accountBalance: pubKey ? accountBalance : '',
      accountDecimals: pubKey ? accountDecimals : null,
    }),
    [accountBalance, accountDecimals, pubKey]
  );
};
