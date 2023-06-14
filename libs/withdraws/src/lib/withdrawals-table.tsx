import { useEffect, useRef, useState } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import {
  addDecimalsFormatNumber,
  convertToCountdownString,
  getDateTimeFormat,
  isNumeric,
  truncateByChars,
} from '@vegaprotocol/utils';
import { useBottomPlaceholder } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';
import {
  ButtonLink,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import type {
  TypedDataAgGrid,
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/datagrid';
import { AgGridLazy as AgGrid } from '@vegaprotocol/datagrid';
import { EtherscanLink } from '@vegaprotocol/environment';
import type { WithdrawalFieldsFragment } from './__generated__/Withdrawal';
import {
  useEthWithdrawApprovalsStore,
  useWithdrawalApprovalDialog,
} from '@vegaprotocol/web3';
import * as Schema from '@vegaprotocol/types';
import type { TimestampedWithdrawals } from './use-ready-to-complete-withdrawals-toast';
import classNames from 'classnames';

export const WithdrawalsTable = (
  props: TypedDataAgGrid<WithdrawalFieldsFragment> & {
    ready?: TimestampedWithdrawals;
    delayed?: TimestampedWithdrawals;
  }
) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const createWithdrawApproval = useEthWithdrawApprovalsStore(
    (store) => store.create
  );

  const bottomPlaceholderProps = useBottomPlaceholder({ gridRef });
  return (
    <AgGrid
      overlayNoRowsTemplate={t('No withdrawals')}
      defaultColDef={{ resizable: true }}
      style={{ width: '100%', height: '100%' }}
      components={{
        RecipientCell,
        StatusCell,
        EtherscanLinkCell,
        CompleteCell,
      }}
      suppressCellFocus
      ref={gridRef}
      {...bottomPlaceholderProps}
      {...props}
    >
      <AgGridColumn headerName="Asset" field="asset.symbol" />
      <AgGridColumn
        headerName={t('Amount')}
        field="amount"
        valueFormatter={({
          value,
          data,
        }: VegaValueFormatterParams<WithdrawalFieldsFragment, 'amount'>) => {
          return isNumeric(value) && data?.asset
            ? addDecimalsFormatNumber(value, data.asset.decimals)
            : '';
        }}
      />
      <AgGridColumn
        headerName={t('Recipient')}
        field="details.receiverAddress"
        cellRenderer="RecipientCell"
        valueFormatter={({
          value,
          data,
        }: VegaValueFormatterParams<
          WithdrawalFieldsFragment,
          'details.receiverAddress'
        >) => {
          if (!data) return null;
          if (!value) return '-';
          return truncateByChars(value);
        }}
      />
      <AgGridColumn
        headerName={t('Created')}
        field="createdTimestamp"
        valueFormatter={({
          value,
          data,
        }: VegaValueFormatterParams<
          WithdrawalFieldsFragment,
          'createdTimestamp'
        >) =>
          data
            ? value
              ? getDateTimeFormat().format(new Date(value))
              : '-'
            : null
        }
      />
      <AgGridColumn
        headerName={t('Completed')}
        field="withdrawnTimestamp"
        valueFormatter={({
          value,
          data,
        }: VegaValueFormatterParams<
          WithdrawalFieldsFragment,
          'withdrawnTimestamp'
        >) =>
          data
            ? value
              ? getDateTimeFormat().format(new Date(value))
              : '-'
            : null
        }
      />
      <AgGridColumn
        headerName={t('Status')}
        field="status"
        cellRendererParams={{ ready: props.ready, delayed: props.delayed }}
        cellRenderer="StatusCell"
      />
      <AgGridColumn
        headerName={t('Transaction')}
        field="txHash"
        flex={2}
        type="rightAligned"
        cellRendererParams={{
          complete: (withdrawal: WithdrawalFieldsFragment) => {
            createWithdrawApproval(withdrawal);
          },
        }}
        cellRendererSelector={({
          data,
        }: VegaICellRendererParams<WithdrawalFieldsFragment>) => ({
          component: data?.txHash ? 'EtherscanLinkCell' : 'CompleteCell',
        })}
      />
    </AgGrid>
  );
};

export type CompleteCellProps = {
  data: WithdrawalFieldsFragment;
  complete: (withdrawal: WithdrawalFieldsFragment) => void;
};
export const CompleteCell = ({ data, complete }: CompleteCellProps) => {
  const open = useWithdrawalApprovalDialog((state) => state.open);
  const ref = useRef<HTMLDivElement>(null);

  if (!data) {
    return null;
  }
  return data.pendingOnForeignChain ? (
    '-'
  ) : (
    <div className="flex justify-end gap-1">
      <ButtonLink
        data-testid="complete-withdrawal"
        onClick={() => complete(data)}
      >
        {t('Complete withdrawal')}
      </ButtonLink>

      <DropdownMenu
        trigger={
          <DropdownMenuTrigger
            className="hover:bg-vega-light-200 dark:hover:bg-vega-dark-200 p-0.5 focus:rounded-full hover:rounded-full"
            data-testid="dropdown-menu"
          >
            <VegaIcon name={VegaIconNames.KEBAB} />
          </DropdownMenuTrigger>
        }
      >
        <DropdownMenuContent>
          <DropdownMenuItem
            key={'withdrawal-approval'}
            data-testid="withdrawal-approval"
            ref={ref}
            onClick={() => {
              if (data.id) {
                open(data.id, ref.current, false);
              }
            }}
          >
            <span>
              <Icon name="info-sign" size={4} /> {t('View withdrawal details')}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const EtherscanLinkCell = ({
  value,
}: VegaValueFormatterParams<WithdrawalFieldsFragment, 'txHash'>) => {
  if (!value) return '-';
  return (
    <EtherscanLink tx={value} data-testid="etherscan-link">
      {truncateByChars(value)}
    </EtherscanLink>
  );
};

export const StatusCell = ({
  data,
  ready,
  delayed,
}: {
  data: WithdrawalFieldsFragment;
  ready?: TimestampedWithdrawals;
  delayed?: TimestampedWithdrawals;
}) => {
  const READY_TO_COMPLETE = t('Ready to complete');
  const DELAYED = (readyIn: string) => t('Delayed (ready in %s)', readyIn);
  const PENDING = t('Pending');
  const COMPLETED = t('Completed');
  const REJECTED = t('Rejected');
  const FAILED = t('Failed');

  const isPending = data.pendingOnForeignChain || !data.txHash;
  const isReady = ready?.find((w) => w.data.id === data.id);
  const isDelayed = delayed?.find((w) => w.data.id === data.id);

  const determineLabel = () => {
    if (isPending) {
      if (isReady) {
        return READY_TO_COMPLETE;
      }
      return PENDING;
    }
    if (data.status === Schema.WithdrawalStatus.STATUS_FINALIZED) {
      return COMPLETED;
    }
    if (data.status === Schema.WithdrawalStatus.STATUS_REJECTED) {
      return REJECTED;
    }
    return FAILED;
  };

  const [label, setLabel] = useState<string | undefined>(determineLabel());
  useEffect(() => {
    // handle countdown for delayed withdrawals
    let interval: NodeJS.Timer;
    if (!data || !isDelayed || isDelayed.timestamp == null || !isPending) {
      return;
    }

    // eslint-disable-next-line prefer-const
    interval = setInterval(() => {
      if (isDelayed.timestamp == null) return;
      const remaining = Date.now() - isDelayed.timestamp;
      if (remaining < 0) {
        setLabel(DELAYED(convertToCountdownString(remaining, '0:00:00:00')));
      } else {
        setLabel(READY_TO_COMPLETE);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [READY_TO_COMPLETE, data, delayed, isDelayed, isPending]);

  return data ? (
    <span
      className={classNames({
        'text-vega-blue-450': label === READY_TO_COMPLETE,
      })}
    >
      {label}
    </span>
  ) : null;
};

const RecipientCell = ({
  value,
  valueFormatted,
}: VegaICellRendererParams<
  WithdrawalFieldsFragment,
  'details.receiverAddress'
>) => {
  return (
    <EtherscanLink address={value} data-testid="etherscan-link">
      {valueFormatted}
    </EtherscanLink>
  );
};
