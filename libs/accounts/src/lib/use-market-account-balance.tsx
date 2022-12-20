import { useCallback, useMemo, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { accountsDataProvider } from './accounts-data-provider';
import type { Account } from './accounts-data-provider';
import { getMarketAccount } from './get-market-account';

export const useMarketAccountBalance = (marketId: string) => {
  const { pubKey } = useVegaWallet();
  const [accountBalance, setAccountBalance] = useState<string>('');
  const [accountDecimals, setAccountDecimals] = useState<number | null>(null);
  const variables = useMemo(() => {
    return { partyId: pubKey || '' };
  }, [pubKey]);
  const update = useCallback(
    ({ data }: { data: Account[] | null }) => {
      const account = getMarketAccount({ accounts: data, marketId });
      if (accountBalance !== account?.balance) {
        setAccountBalance(account?.balance || '');
      }
      if (accountDecimals !== account?.asset.decimals) {
        setAccountDecimals(account?.asset.decimals || null);
      }
      return true;
    },
    [accountBalance, accountDecimals, marketId]
  );

  useDataProvider({
    dataProvider: accountsDataProvider,
    variables,
    skip: !pubKey || !marketId,
    update,
  });

  return useMemo(
    () => ({
      accountBalance,
      accountDecimals,
    }),
    [accountBalance, accountDecimals]
  );
};
