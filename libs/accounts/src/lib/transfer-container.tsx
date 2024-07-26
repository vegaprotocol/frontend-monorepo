import sortBy from 'lodash/sortBy';
import * as Schema from '@vegaprotocol/types';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import { useDataProvider } from '@vegaprotocol/data-provider';
import type { Transfer } from '@vegaprotocol/wallet';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useCallback } from 'react';
import { accountsDataProvider } from './accounts-data-provider';
import { TransferForm } from './transfer-form';

export const ALLOWED_ACCOUNTS = [
  Schema.AccountType.ACCOUNT_TYPE_GENERAL,
  Schema.AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
];

export const TransferContainer = ({ assetId }: { assetId?: string }) => {
  const { pubKey, pubKeys, isReadOnly } = useVegaWallet();
  const { params } = useNetworkParams([
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
    <TransferForm
      pubKey={pubKey}
      pubKeys={pubKeys}
      isReadOnly={isReadOnly}
      assetId={assetId}
      minQuantumMultiple={params.transfer_minTransferQuantumMultiple}
      submitTransfer={transfer}
      accounts={sortedAccounts}
    />
  );
};
