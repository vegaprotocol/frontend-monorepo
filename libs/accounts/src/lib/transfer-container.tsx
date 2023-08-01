import * as Schema from '@vegaprotocol/types';
import { addDecimal, truncateByChars } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  NetworkParams,
  useNetworkParam,
} from '@vegaprotocol/network-parameters';
import { useDataProvider } from '@vegaprotocol/data-provider';
import type { Transfer } from '@vegaprotocol/wallet';
import {
  useVegaTransactionStore,
  useVegaWallet,
  useVegaWalletDialogStore,
} from '@vegaprotocol/wallet';
import { useCallback, useMemo } from 'react';
import { accountsDataProvider } from './accounts-data-provider';
import { TransferForm } from './transfer-form';
import sortBy from 'lodash/sortBy';
import {
  ExternalLink,
  Intent,
  Lozenge,
  Notification,
} from '@vegaprotocol/ui-toolkit';

export const TransferContainer = ({ assetId }: { assetId?: string }) => {
  const { pubKey, pubKeys } = useVegaWallet();
  const { param } = useNetworkParam(NetworkParams.transfer_fee_factor);
  const { data } = useDataProvider({
    dataProvider: accountsDataProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });

  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );

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
      <p className="text-sm mb-4" data-testid="transfer-intro-text">
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
      {!pubKey && (
        <div className="mb-4">
          <Notification
            intent={Intent.Warning}
            message={
              <p className="text-sm pb-2">
                You need a{' '}
                <ExternalLink href="https://vega.xyz/wallet">
                  Vega wallet
                </ExternalLink>{' '}
                to make a transfer.
              </p>
            }
            buttonProps={{
              text: t('Connect wallet'),
              action: openVegaWalletDialog,
              dataTestId: 'order-connect-wallet',
              size: 'small',
            }}
          />
        </div>
      )}
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
