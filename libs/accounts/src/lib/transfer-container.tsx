import * as Schema from '@vegaprotocol/types';
import {
  addDecimal,
  NetworkParams,
  useDataProvider,
  useNetworkParam,
} from '@vegaprotocol/react-helpers';
import type { Transfer } from '@vegaprotocol/wallet';
import { useVegaTransactionStore, useVegaWallet } from '@vegaprotocol/wallet';
import { useCallback, useMemo } from 'react';
import { accountsDataProvider } from './accounts-data-provider';
import { TransferForm } from './transfer-form';

export const TransferContainer = () => {
  const { pubKey, pubKeys } = useVegaWallet();
  const { param } = useNetworkParam(NetworkParams.transfer_fee_factor);
  const { data } = useDataProvider({
    dataProvider: accountsDataProvider,
    variables: { partyId: pubKey },
    skip: !pubKey,
  });
  const create = useVegaTransactionStore((store) => store.create);

  const transfer = useCallback(
    (transfer: Transfer) => {
      create({ transfer });
    },
    [create]
  );

  const assets = useMemo(() => {
    if (!data) return [];
    return data
      .filter(
        (account) => account.type === Schema.AccountType.ACCOUNT_TYPE_GENERAL
      )
      .map((account) => ({
        id: account.asset.id,
        symbol: account.asset.symbol,
        name: account.asset.name,
        decimals: account.asset.decimals,
        balance: addDecimal(account.balance, account.asset.decimals),
      }));
  }, [data]);

  return (
    <TransferForm
      pubKey={pubKey}
      pubKeys={pubKeys ? pubKeys?.map((pk) => pk.publicKey) : null}
      assets={assets}
      feeFactor={param}
      submitTransfer={transfer}
    />
  );
};
