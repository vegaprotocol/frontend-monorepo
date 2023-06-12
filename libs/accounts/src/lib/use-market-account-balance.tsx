import { useCallback, useMemo, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { accountsDataProvider } from './accounts-data-provider';
import type { Account } from './accounts-data-provider';
import { getMarketAccount } from './get-market-account';

export const useMarketAccountBalance = (marketId: string) => {
  const { pubKey } = useVegaWallet();
  const [accountBalance, setAccountBalance] = useState<string | undefined>(
    undefined
  );
  const [accountDecimals, setAccountDecimals] = useState<number | undefined>(
    undefined
  );
  const update = useCallback(
    ({ data }: { data: Account[] | null }) => {
      const account = getMarketAccount({ accounts: data, marketId });
      if (account?.balance) {
        setAccountBalance(account?.balance);
      }
      if (account?.asset.decimals) {
        setAccountDecimals(account?.asset.decimals);
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
      accountBalance: pubKey ? accountBalance : undefined,
      accountDecimals: pubKey ? accountDecimals : undefined,
    }),
    [accountBalance, accountDecimals, pubKey]
  );
};
