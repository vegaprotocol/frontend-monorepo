import { useCallback, useMemo, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { accountsDataProvider } from './accounts-data-provider';
import type { Account } from './accounts-data-provider';
import { getSettlementAccount } from './get-settlement-account';

export const useAccountBalance = (assetId?: string) => {
  const { pubKey } = useVegaWallet();
  const [accountBalance, setAccountBalance] = useState<string | undefined>(
    undefined
  );
  const [accountDecimals, setAccountDecimals] = useState<number | undefined>(
    undefined
  );
  const variables = useMemo(() => {
    return { partyId: pubKey || '' };
  }, [pubKey]);
  const update = useCallback(
    ({ data }: { data: Account[] | null }) => {
      const account = assetId
        ? getSettlementAccount({ accounts: data, assetId })
        : undefined;
      setAccountBalance(account?.balance);
      setAccountDecimals(account?.asset.decimals);
      return true;
    },
    [assetId]
  );

  useDataProvider({
    dataProvider: accountsDataProvider,
    variables,
    skip: !pubKey || !assetId,
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
