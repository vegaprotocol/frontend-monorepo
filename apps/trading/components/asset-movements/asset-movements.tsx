import type { ColDef } from 'ag-grid-community';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { DAY, getDateTimeFormat, getTimeFormat } from '@vegaprotocol/utils';
import {
  DepositStatus,
  DepositStatusMapping,
  TransferStatusMapping,
  WithdrawalStatusMapping,
} from '@vegaprotocol/types';
import {
  ApprovalStatus,
  useEthWithdrawApprovalsStore,
  useEthereumConfig,
  useGetWithdrawDelay,
  useGetWithdrawThreshold,
  useTransactionReceipt,
} from '@vegaprotocol/web3';
import { useT } from '../../lib/use-t';

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

  return <>{WithdrawalStatusMapping[data.detail.status]}</>;
};

const WithdrawalStatusOpen = ({ data }: { data: RowWithdrawal }) => {
  const { status, readyAt } = useWithdrawalStatus({
    withdrawal: data.detail,
  });

  if (status === ApprovalStatus.Idle) {
    return null;
  }

  if (status === ApprovalStatus.Delayed) {
    const showDate = readyAt && readyAt.getTime() > Date.now() + DAY;

    return (
      <>
        {status} until{' '}
        {showDate
          ? getDateTimeFormat().format(readyAt)
          : getTimeFormat().format(readyAt)}
      </>
    );
  }

  if (status === ApprovalStatus.Ready) {
    return <WithdrawalStatusReady withdrawal={data.detail} />;
  }

  return <>{status}</>;
};

const WithdrawalStatusReady = ({
  withdrawal,
}: {
  withdrawal: WithdrawalFieldsFragment;
}) => {
  const t = useT();
  const createWithdrawApproval = useEthWithdrawApprovalsStore(
    (store) => store.create
  );

  return (
    <>
      {ApprovalStatus.Ready}{' '}
      <button
        onClick={() => createWithdrawApproval(withdrawal)}
        className="underline underline-offset-4"
      >
        {t('Complete')}
      </button>
    </>
  );
};

const useWithdrawalStatus = ({
  withdrawal,
}: {
  withdrawal: WithdrawalFieldsFragment;
}) => {
  const [status, setStatus] = useState<ApprovalStatus>(ApprovalStatus.Idle);
  const [readyAt, setReadyAt] = useState<Date>();
  const getThreshold = useGetWithdrawThreshold();
  const getDelay = useGetWithdrawDelay();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Checks if withdrawal is ready for completion and if it isn't
    // starts a time to check again after the delay time has passed
    const checkStatus = async () => {
      const threshold = await getThreshold(withdrawal.asset);

      if (threshold) {
        const delaySecs = await getDelay();

        if (delaySecs) {
          const readyTimestamp =
            new Date(withdrawal.createdTimestamp).getTime() +
            (delaySecs + 3) * 1000; // add a buffer of 3 seconds
          const now = Date.now();
          setReadyAt(new Date(readyTimestamp));

          if (now < readyTimestamp) {
            setStatus(ApprovalStatus.Delayed);

            // Check again when delay time has passed
            timeoutRef.current = setTimeout(checkStatus, readyTimestamp - now);
          } else {
            setStatus(ApprovalStatus.Ready);
          }
        }
      }
    };

    checkStatus();

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [getThreshold, getDelay, withdrawal]);

  return { status, readyAt };
};
