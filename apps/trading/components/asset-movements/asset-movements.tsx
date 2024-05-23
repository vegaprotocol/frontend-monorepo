import type { ColDef } from 'ag-grid-community';
import { useEffect, useMemo } from 'react';
import compact from 'lodash/compact';

import { AgGrid, COL_DEFS } from '@vegaprotocol/datagrid';
import {
  type DepositFieldsFragment,
  useDeposits,
} from '@vegaprotocol/deposits';
import {
  type WithdrawalFieldsFragment,
  useWithdrawals,
} from '@vegaprotocol/withdraws';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import {
  type TransferFieldsFragment,
  useTransfers,
} from '@vegaprotocol/accounts';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import {
  DepositStatus,
  DepositStatusMapping,
  TransferStatusMapping,
  WithdrawalStatus,
  WithdrawalStatusMapping,
} from '@vegaprotocol/types';
import {
  useEthereumConfig,
  useGetWithdrawDelay,
  useGetWithdrawThreshold,
  useTransactionReceipt,
} from '@vegaprotocol/web3';
import { useT } from '../../lib/use-t';
import { Withdraw } from 'apps/trading/client-pages/withdraw';

interface RowBase {
  asset: AssetFieldsFragment | undefined;
  amount: string;
  createdTimestamp: Date;
}

interface RowDeposit extends RowBase {
  type: 'Deposit';
  detail: DepositFieldsFragment;
}

interface RowWithdrawal extends RowBase {
  type: 'Withdrawal';
  detail: WithdrawalFieldsFragment;
}

interface RowTransfer extends RowBase {
  type: 'Transfer';
  detail: TransferFieldsFragment;
}

type Row = RowDeposit | RowWithdrawal | RowTransfer;

export const AssetMovements = () => {
  const { pubKey } = useVegaWallet();
  const { data: deposits } = useDeposits({ pubKey });
  const { data: withdrawals } = useWithdrawals({ pubKey });
  const { data: transfers } = useTransfers({ pubKey });

  const rowData = compact(
    [...(deposits || []), ...(withdrawals || []), ...(transfers || [])].map(
      normalizeItem
    )
  );

  return <AssetMovementsDatagrid partyId={pubKey} rowData={rowData} />;
};

export const AssetMovementsDatagrid = ({
  partyId,
  rowData,
}: {
  partyId?: string;
  rowData: Row[];
}) => {
  const t = useT();
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: t('Type'),
        field: 'type',
        valueFormatter: ({ value, data }: { value: string; data: Row }) => {
          let postfix = '';

          // show direction of transfer
          if (data.type === 'Transfer') {
            if (data.detail.to === partyId) {
              postfix = ' from';
            } else if (data.detail.from === partyId) {
              postfix = ' to';
            }
          }

          return `${value}${postfix}`;
        },
      },
      { headerName: t('Asset'), field: 'asset.symbol' },

      {
        headerName: t('Created at'),
        field: 'createdTimestamp',
        valueFormatter: ({ value }) => getDateTimeFormat().format(value),
        sort: 'desc',
      },
      {
        headerName: t('Amount'),
        field: 'amount',
      },
      {
        headerName: t('To/From'),
        field: 'type',
        valueFormatter: ({ data }: { data: Row }) => {
          // TODO: provide link to etherscan
          if (data.type === 'Deposit') {
            return `Tx: ${data.detail.txHash}`;
          }

          if (data.type === 'Withdrawal') {
            return `To: ${data.detail.details?.receiverAddress}`;
          }

          if (data.type === 'Transfer') {
            if (data.detail.to === partyId) {
              return `From: ${data.detail.from}`;
            } else if (data.detail.from === partyId) {
              return `To: ${data.detail.to}`;
            }
          }

          return '-';
        },
      },
      {
        headerName: 'Status',
        field: 'type',
        cellRenderer: ({ data }: { data: Row }) => {
          if (data.type === 'Deposit') {
            return <DepositStatusCell data={data} />;
          }

          if (data.type === 'Withdrawal') {
            // TODO: show pending approve/pending network/complete
            return <WithdrawalStatusCell data={data} />;
          }

          if (data.type === 'Transfer') {
            return TransferStatusMapping[data.detail.status];
          }

          return '-';
        },
      },
    ],
    [partyId, t]
  );

  return (
    <AgGrid
      columnDefs={columnDefs}
      defaultColDef={COL_DEFS.default}
      rowData={rowData}
    />
  );
};

const normalizeItem = (
  item:
    | DepositFieldsFragment
    | WithdrawalFieldsFragment
    | TransferFieldsFragment
): Row | null => {
  if (item.__typename === 'Withdrawal') {
    return {
      asset: item.asset,
      type: 'Withdrawal',
      amount: item.amount,
      createdTimestamp: new Date(item.createdTimestamp),
      detail: item,
    };
  }

  if (item.__typename === 'Deposit') {
    return {
      asset: item.asset,
      type: 'Deposit',
      amount: item.amount,
      createdTimestamp: new Date(item.createdTimestamp),
      detail: item,
    };
  }

  if (item.__typename === 'Transfer') {
    return {
      // @ts-ignore TODO: fix me
      asset: item.asset,
      type: 'Transfer',
      amount: item.amount,
      createdTimestamp: new Date(item.timestamp),
      detail: item,
    };
  }

  return null;
};

const DepositStatusCell = ({ data }: { data: RowDeposit }) => {
  const t = useT();
  const { config } = useEthereumConfig();

  const { receipt } = useTransactionReceipt({
    txHash: data.detail.txHash,
    enabled: data.detail.status === DepositStatus.STATUS_OPEN,
    confirmations: config?.confirmations,
  });

  if (data.detail.status === DepositStatus.STATUS_OPEN) {
    return (
      <>
        {DepositStatusMapping[data.detail.status]} ({receipt?.confirmations}{' '}
        {t('Confirmations')})
      </>
    );
  }

  return <>{DepositStatusMapping[data.detail.status]}</>;
};

const WithdrawalStatusCell = ({ data }: { data: RowWithdrawal }) => {
  if (!data.detail.txHash) {
    // TODO: add click to complete
    return <WithdrawalStatusOpen data={data} />;
  }

  return <>{WithdrawalStatus[data.detail.status]}</>;
};

const WithdrawalStatusOpen = ({ data }: { data: RowWithdrawal }) => {
  const getThreshold = useGetWithdrawThreshold();
  const getDelay = useGetWithdrawDelay();

  useEffect(() => {
    async () => {
      console.log('get');
      const threshold = await getThreshold(data.detail.asset);
      const delay = await getDelay();
      console.log(threshold, delay);
    };
  }, [getThreshold, getDelay]);

  return <>hello</>;
};
