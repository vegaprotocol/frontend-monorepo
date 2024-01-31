import { useCallback, useMemo, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { accountsDataProvider } from './accounts-data-provider';
import type { Account } from './accounts-data-provider';
import { AccountType } from '@vegaprotocol/types';

export const useMarginAccountBalance = (marketId: string) => {
  const { pubKey } = useVegaWallet();
  const [marginAccountBalance, setMarginAccountBalance] = useState<string>('');
  const [orderMarginAccountBalance, setOrderMarginAccountBalance] =
    useState<string>('');
  const [accountDecimals, setAccountDecimals] = useState<number | null>(null);
  const update = useCallback(
    ({ data }: { data: Account[] | null }) => {
      const marginAccount = data?.find((account) => {
        return (
          account.market?.id === marketId &&
          account.type === AccountType.ACCOUNT_TYPE_MARGIN
        );
      });
      const orderMarginAccount = data?.find((account) => {
        return (
          account.market?.id === marketId &&
          account.type === AccountType.ACCOUNT_TYPE_ORDER_MARGIN
        );
      });
      if (marginAccount?.balance) {
        setMarginAccountBalance(marginAccount?.balance || '');
      }
      if (orderMarginAccount?.balance) {
        setOrderMarginAccountBalance(orderMarginAccount?.balance || '');
      }

      const decimals =
        orderMarginAccount?.asset.decimals || marginAccount?.asset.decimals;
      if (decimals) {
        setAccountDecimals(decimals);
      }
      return true;
    },
    [marketId]
  );
  const { loading, error } = useDataProvider({
    dataProvider: accountsDataProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey || !marketId,
    update,
  });

  return useMemo(
    () => ({
      marginAccountBalance: pubKey ? marginAccountBalance : '',
      orderMarginAccountBalance: pubKey ? orderMarginAccountBalance : '',
      accountDecimals: pubKey ? accountDecimals : null,
      loading,
      error,
    }),
    [
      marginAccountBalance,
      orderMarginAccountBalance,
      accountDecimals,
      pubKey,
      loading,
      error,
    ]
  );
};
