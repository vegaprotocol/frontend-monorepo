import type { ColDef } from 'ag-grid-community';
import type BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import compact from 'lodash/compact';

import { AgGrid, COL_DEFS } from '@vegaprotocol/datagrid';
import {
  DApp,
  ETHERSCAN_ADDRESS,
  EXPLORER_PARTIES,
  useEtherscanLink,
  useLinks,
} from '@vegaprotocol/environment';
import {
  type DepositFieldsFragment,
  useDeposits,
} from '@vegaprotocol/deposits';
import {
  type WithdrawalFieldsFragment,
  useWithdrawals,
} from '@vegaprotocol/withdraws';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import {
  useAssetDetailsDialogStore,
  type AssetFieldsFragment,
} from '@vegaprotocol/assets';
import {
  type TransferFieldsFragment,
  useTransfers,
} from '@vegaprotocol/accounts';
import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
  toBigNum,
} from '@vegaprotocol/utils';
import { TransferStatusMapping } from '@vegaprotocol/types';
import { useEthereumConfig, useTransactionReceipt } from '@vegaprotocol/web3';

import { useT } from '../../lib/use-t';
import { DepositStatusCell } from './deposit-status-cell';
import { WithdrawalStatusCell } from './withdrawal-status-cell';

export interface RowBase {
  asset: AssetFieldsFragment | undefined;
  amount: string;
  bAmount: BigNumber;
  createdTimestamp: Date;
}

export interface RowDeposit extends RowBase {
  type: 'Deposit';
  detail: DepositFieldsFragment;
}

export interface RowWithdrawal extends RowBase {
  type: 'Withdrawal';
  detail: WithdrawalFieldsFragment;
}

export interface RowTransfer extends RowBase {
  type: 'Transfer';
  detail: TransferFieldsFragment;
}

export type Row = RowDeposit | RowWithdrawal | RowTransfer;

export const AssetActivity = () => {
  const { pubKey } = useVegaWallet();
  const { data: deposits } = useDeposits({ pubKey });
  const { data: withdrawals } = useWithdrawals({ pubKey });
  const { data: transfers } = useTransfers({ pubKey });

  const rowData = compact(
    [...(deposits || []), ...(withdrawals || []), ...(transfers || [])].map(
      normalizeItem
    )
  );

  return <AssetActivityDatagrid partyId={pubKey} rowData={rowData} />;
};

export const AssetActivityDatagrid = ({
  partyId,
  rowData,
}: {
  partyId?: string;
  rowData: Row[];
}) => {
  const t = useT();
  const open = useAssetDetailsDialogStore((store) => store.open);
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: t('Type'),
        field: 'type',
        filter: 'agSetColumnFilter',
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
      {
        headerName: t('Asset'),
        field: 'asset.symbol',
        cellClass: 'underline underline-offset-4',
        filter: 'agTextColumnFilter',
        onCellClicked: ({ data }: { data: Row }) => {
          if (!data.asset) return;
          open(data.asset.id);
        },
      },

      {
        headerName: t('Created at'),
        field: 'createdTimestamp',
        filter: 'agDateColumnFilter',
        valueFormatter: ({ value }) => getDateTimeFormat().format(value),
        sort: 'desc',
      },
      {
        headerName: t('Amount'),
        field: 'amount',
        filter: 'agNumberColumnFilter',
        valueGetter: ({ data }: { data: Row }) => {
          return data.bAmount.toNumber();
        },
        valueFormatter: ({ data }: { data: Row }) => {
          if (!data.amount || !data.asset) return '-';
          return addDecimalsFormatNumber(data.amount, data.asset.decimals);
        },
      },
      {
        headerName: t('To/From'),
        field: 'type',
        cellRenderer: ({ data }: { data: Row }) => {
          if (data.type === 'Deposit') {
            return <DepositToFromCell data={data} />;
          }

          if (data.type === 'Withdrawal') {
            return <WithdrawalToFromCell data={data} />;
          }

          if (data.type === 'Transfer') {
            return <TransferToFromCell data={data} partyId={partyId} />;
          }

          return '-';
        },
      },
      {
        headerName: 'Status',
        field: 'type',
        filter: 'agSetColumnFilter',
        cellRenderer: ({ data }: { data: Row }) => {
          if (data.type === 'Deposit') {
            return <DepositStatusCell data={data} />;
          }

          if (data.type === 'Withdrawal') {
            return <WithdrawalStatusCell data={data} />;
          }

          if (data.type === 'Transfer') {
            return TransferStatusMapping[data.detail.status];
          }

          return '-';
        },
      },
    ],
    [partyId, t, open]
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
  if (!item.asset) return null;

  const bAmount = toBigNum(item.amount, item.asset.decimals);

  if (item.__typename === 'Withdrawal') {
    return {
      asset: item.asset,
      type: 'Withdrawal',
      amount: item.amount,
      bAmount,
      createdTimestamp: new Date(item.createdTimestamp),
      detail: item,
    };
  }

  if (item.__typename === 'Deposit') {
    return {
      asset: item.asset,
      type: 'Deposit',
      amount: item.amount,
      bAmount,
      createdTimestamp: new Date(item.createdTimestamp),
      detail: item,
    };
  }

  if (item.__typename === 'Transfer') {
    return {
      asset: item.asset,
      type: 'Transfer',
      amount: item.amount,
      bAmount,
      createdTimestamp: new Date(item.timestamp),
      detail: item,
    };
  }

  return null;
};

const TransferToFromCell = ({
  data,
  partyId,
}: {
  data: RowTransfer;
  partyId?: string;
}) => {
  const t = useT();
  const linkCreator = useLinks(DApp.Explorer);

  if (data.detail.to === partyId) {
    return (
      <>
        {t('From')}:{' '}
        <Link
          to={linkCreator(EXPLORER_PARTIES.replace(':id', data.detail.from))}
          target="_blank"
          className="underline underline-offset-4"
        >
          {data.detail.from}
        </Link>
      </>
    );
  } else if (data.detail.from === partyId) {
    return (
      <>
        {t('To')}:{' '}
        <Link
          to={linkCreator(EXPLORER_PARTIES.replace(':id', data.detail.to))}
          target="_blank"
          className="underline underline-offset-4"
        >
          {data.detail.from}
        </Link>
      </>
    );
  }

  return <>-</>;
};

const WithdrawalToFromCell = ({ data }: { data: RowWithdrawal }) => {
  const t = useT();
  const { config } = useEthereumConfig();
  const etherscanLink = useEtherscanLink(Number(config?.chain_id || 1));
  const receiverAddress = data.detail.details?.receiverAddress;

  if (!receiverAddress) return <>-</>;

  return (
    <>
      {t('To')}:{' '}
      <Link
        to={etherscanLink(ETHERSCAN_ADDRESS.replace(':hash', receiverAddress))}
        className="underline underline-offset-4"
        target="_blank"
      >
        {receiverAddress}
      </Link>
    </>
  );
};

const DepositToFromCell = ({ data }: { data: RowDeposit }) => {
  const t = useT();
  const { config } = useEthereumConfig();
  const etherscanLink = useEtherscanLink(Number(config?.chain_id || 1));

  const { receipt } = useTransactionReceipt({
    txHash: data.detail.txHash,
    enabled: true,
  });

  if (!receipt) return null;

  return (
    <>
      {t('From')}:{' '}
      <Link
        to={etherscanLink(ETHERSCAN_ADDRESS.replace(':hash', receipt.from))}
        className="underline underline-offset-4"
        target="_blank"
      >
        {receipt.from}
      </Link>
    </>
  );
};
