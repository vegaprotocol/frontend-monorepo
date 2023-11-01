import * as Schema from '@vegaprotocol/types';
import { addDecimal, truncateByChars } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  NetworkParams,
  useNetworkParam,
} from '@vegaprotocol/network-parameters';
import { useDataProvider } from '@vegaprotocol/data-provider';
import type { Transfer } from '@vegaprotocol/wallet';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useCallback } from 'react';
import { accountsDataProvider } from './accounts-data-provider';
import { TransferForm } from './transfer-form';
import sortBy from 'lodash/sortBy';
import { Lozenge } from '@vegaprotocol/ui-toolkit';

export const ALLOWED_ACCOUNTS = [
  Schema.AccountType.ACCOUNT_TYPE_GENERAL,
  Schema.AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
];

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

  const accounts = data
    ? data.filter((account) => ALLOWED_ACCOUNTS.includes(account.type))
    : [];

  const assets = accounts.map((account) => ({
    id: account.asset.id,
    symbol: account.asset.symbol,
    name: account.asset.name,
    decimals: account.asset.decimals,
    balance: addDecimal(account.balance, account.asset.decimals),
  }));

  if (data === null) return null;

  return (
    <>
      <p className="mb-4 text-sm" data-testid="transfer-intro-text">
        {t('Transfer funds to another Vega key')}
        {pubKey && (
          <>
            {t(' from ')}
            <Lozenge className="font-mono">
              {truncateByChars(pubKey || '')}
            </Lozenge>
          </>
        )}
        {t('. If you are at all unsure, stop and seek advice.')}
      </p>
      <TransferForm
        pubKey={pubKey}
        pubKeys={pubKeys ? pubKeys?.map((pk) => pk.publicKey) : null}
        assets={sortBy(assets, 'name')}
        assetId={assetId}
        feeFactor={param}
        submitTransfer={transfer}
        accounts={accounts}
      />
    </>
  );
};
