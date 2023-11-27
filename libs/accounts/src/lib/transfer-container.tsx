import sortBy from 'lodash/sortBy';
import * as Schema from '@vegaprotocol/types';
import { Trans } from 'react-i18next';
import { truncateByChars } from '@vegaprotocol/utils';
import { ns, useT } from './use-t';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import { useDataProvider } from '@vegaprotocol/data-provider';
import type { Transfer } from '@vegaprotocol/wallet';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useCallback } from 'react';
import { accountsDataProvider } from './accounts-data-provider';
import { TransferForm } from './transfer-form';
import { Lozenge } from '@vegaprotocol/ui-toolkit';

export const ALLOWED_ACCOUNTS = [
  Schema.AccountType.ACCOUNT_TYPE_GENERAL,
  Schema.AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
];

export const TransferContainer = ({ assetId }: { assetId?: string }) => {
  const t = useT();
  const { pubKey, pubKeys } = useVegaWallet();
  const { params } = useNetworkParams([
    NetworkParams.transfer_fee_factor,
    NetworkParams.transfer_minTransferQuantumMultiple,
  ]);

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
  const sortedAccounts = sortBy(accounts, (a) => a.asset.symbol.toLowerCase());

  return (
    <>
      <p className="mb-4 text-sm" data-testid="transfer-intro-text">
        {pubKey ? (
          <Trans
            i18nKey="TRANSFER_FUNDS_TO_ANOTHER_KNOWN_VEGA_KEY"
            defaults="Transfer funds to another Vega key <0>{{pubKey}}</0>. If you are at all unsure, stop and seek advice."
            ns={ns}
            components={[<Lozenge className="font-mono">pubKey</Lozenge>]}
            values={{ pubKey: truncateByChars(pubKey || '') }}
          />
        ) : (
          t('TRANSFER_FUNDS_TO_ANOTHER_VEGA_KEY', {
            defaultValue:
              'Transfer funds to another Vega key. If you are at all unsure, stop and seek advice.',
          })
        )}
      </p>
      <TransferForm
        pubKey={pubKey}
        pubKeys={pubKeys ? pubKeys?.map((pk) => pk.publicKey) : null}
        assetId={assetId}
        feeFactor={params.transfer_fee_factor}
        minQuantumMultiple={params.transfer_minTransferQuantumMultiple}
        submitTransfer={transfer}
        accounts={sortedAccounts}
      />
    </>
  );
};
