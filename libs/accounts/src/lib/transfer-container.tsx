import * as Schema from '@vegaprotocol/types';
import { addDecimal, truncateByChars } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  NetworkParams,
  useNetworkParam,
} from '@vegaprotocol/network-parameters';
import { useDataProvider } from '@vegaprotocol/data-provider';
import type { Transfer } from '@vegaprotocol/wallet';
import { useVegaTransactionStore, useVegaWallet } from '@vegaprotocol/wallet';
import { useCallback, useMemo } from 'react';
import { accountsDataProvider } from './accounts-data-provider';
import { TransferForm } from './transfer-form';
import { Lozenge } from '@vegaprotocol/ui-toolkit';
import sortBy from 'lodash/sortBy';

export const TransferContainer = ({ assetId }: { assetId?: string }) => {
  const { pubKey, pubKeys } = useVegaWallet();
  const { param } = useNetworkParam(NetworkParams.transfer_fee_factor);
  const { data } = useDataProvider({
    dataProvider: accountsDataProvider,
    variables: { partyId: pubKey || '' },
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
    <>
      <p className="text-sm mb-4" data-testid="dialog-transfer-text">
        {t('Transfer funds to another Vega key from')}{' '}
        <Lozenge className="font-mono">{truncateByChars(pubKey || '')}</Lozenge>{' '}
        {t('If you are at all unsure, stop and seek advice.')}
      </p>
      <TransferForm
        pubKey={pubKey}
        pubKeys={pubKeys ? pubKeys?.map((pk) => pk.publicKey) : null}
        assets={sortBy(assets, 'name')}
        assetId={assetId}
        feeFactor={param}
        submitTransfer={transfer}
      />
    </>
  );
};
