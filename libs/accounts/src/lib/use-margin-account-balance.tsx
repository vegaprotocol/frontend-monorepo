import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { accountsDataProvider } from './accounts-data-provider';
import { AccountType } from '@vegaprotocol/types';

export const useMarginAccountBalance = (marketId?: string) => {
  const { pubKey } = useVegaWallet();

  const { data, loading, error } = useDataProvider({
    dataProvider: accountsDataProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey || !marketId,
  });

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

  const decimals =
    orderMarginAccount?.asset.decimals || marginAccount?.asset.decimals;

  return {
    marginAccountBalance: marginAccount ? marginAccount.balance : '',
    orderMarginAccountBalance: orderMarginAccount
      ? orderMarginAccount.balance
      : '',
    accountDecimals: pubKey ? decimals : null,
    loading,
    error,
  };
};
