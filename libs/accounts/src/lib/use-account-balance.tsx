import { useVegaWallet } from '@vegaprotocol/wallet';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { accountsDataProvider } from './accounts-data-provider';
import { getSettlementAccount } from './get-settlement-account';

export const useAccountBalance = (assetId?: string) => {
  const { pubKey } = useVegaWallet();

  const { data, loading, error } = useDataProvider({
    dataProvider: accountsDataProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey || !assetId,
  });

  const account = assetId
    ? getSettlementAccount({ accounts: data, assetId })
    : undefined;

  return {
    accountBalance: account ? account.balance : '',
    accountDecimals: account ? account.asset.decimals : null,
    loading,
    error,
  };
};
