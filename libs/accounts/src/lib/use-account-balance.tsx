import { useCallback, useMemo, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { accountsDataProvider } from './accounts-data-provider';
import type { Account } from './accounts-data-provider';
import { getSettlementAccount } from './get-settlement-account';

export const useAccountBalance = (assetId?: string) => {
  const { pubKey } = useVegaWallet();
  const [accountBalance, setAccountBalance] = useState<string>('');
  const [accountDecimals, setAccountDecimals] = useState<number | null>(null);
  const variables = useMemo(() => {
    return { partyId: pubKey || '' };
  }, [pubKey]);
  const update = useCallback(
    ({ data }: { data: Account[] | null }) => {
      const account = assetId
        ? getSettlementAccount({ accounts: data, assetId })
        : undefined;
      if (accountBalance !== account?.balance) {
        setAccountBalance(account?.balance || '');
      }
      if (accountDecimals !== account?.asset.decimals) {
        setAccountDecimals(account?.asset.decimals || null);
      }
      return true;
    },
    [accountBalance, accountDecimals, assetId]
  );

  useDataProvider({
    dataProvider: accountsDataProvider,
    variables,
    skip: !pubKey || !assetId,
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
