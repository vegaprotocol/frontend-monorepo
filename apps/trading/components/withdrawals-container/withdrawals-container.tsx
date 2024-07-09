import { useEffect, useRef, useState, useMemo } from 'react';
import classNames from 'classnames';

import { type ColDef } from 'ag-grid-community';

import {
  withdrawalProvider,
  type WithdrawalFieldsFragment,
} from '@vegaprotocol/withdraws';
import {
  addDecimalsFormatNumber,
  convertToCountdownString,
  getDateTimeFormat,
  isNumeric,
  truncateByChars,
} from '@vegaprotocol/utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  Splash,
  ActionsDropdown,
  ButtonLink,
  TradingDropdownItem,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
  AgGrid,
  COL_DEFS,
  type TypedDataAgGrid,
  type VegaICellRendererParams,
  type VegaValueFormatterParams,
} from '@vegaprotocol/datagrid';
import { BlockExplorerLink } from '@vegaprotocol/environment';
import {
  useEVMBridgeConfigs,
  useEthereumConfig,
  useWithdrawalApprovalDialog,
  useWithdrawalApprovalQuery,
} from '@vegaprotocol/web3';
import * as Schema from '@vegaprotocol/types';
import { getAssetSymbol } from '@vegaprotocol/assets';

import {
  type TimestampedWithdrawals,
  useIncompleteWithdrawals,
} from '../../lib/hooks/use-incomplete-withdrawals';
import { useT } from '../../lib/use-t';
import { useEvmWithdraw } from '../../lib/hooks/use-evm-withdraw';

export const WithdrawalsContainer = () => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const { data, error } = useDataProvider({
    dataProvider: withdrawalProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });
  const { ready, delayed } = useIncompleteWithdrawals();
  if (!pubKey) {
    return <Splash>{t('Please connect Vega wallet')}</Splash>;
  }
  return (
    <WithdrawalsTable
      data-testid="withdrawals-history"
      rowData={data}
      overlayNoRowsTemplate={error ? error.message : t('No withdrawals')}
      ready={ready}
      delayed={delayed}
    />
  );
};

export const WithdrawalsTable = ({
  delayed,
  ready,
  ...props
}: TypedDataAgGrid<WithdrawalFieldsFragment> & {
  ready?: TimestampedWithdrawals;
  delayed?: TimestampedWithdrawals;
}) => {
  const t = useT();

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: t('Asset'),
        field: 'asset',
        pinned: true,
        valueFormatter: ({
          value,
        }: VegaValueFormatterParams<WithdrawalFieldsFragment, 'asset'>) => {
          if (!value) return '-';
          return getAssetSymbol(value);
        },
      },
      {
        headerName: t('Amount'),
        field: 'amount',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<WithdrawalFieldsFragment, 'amount'>) => {
          return isNumeric(value) && data?.asset
            ? addDecimalsFormatNumber(value, data.asset.decimals)
            : '';
        },
      },
      {
        headerName: t('Recipient'),
        field: 'details.receiverAddress',
        cellRenderer: 'RecipientCell',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<
          WithdrawalFieldsFragment,
          'details.receiverAddress'
        >) => {
          if (!data) return '';
          if (!value) return '-';
          return truncateByChars(value);
        },
      },
      {
        headerName: t('Created'),
        field: 'createdTimestamp',
        valueFormatter: ({
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
            : '',
      },
      {
        headerName: t('Completed'),
        field: 'withdrawnTimestamp',
        valueFormatter: ({
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
            : '',
      },
      {
        headerName: t('Status'),
        field: 'status',
        cellRenderer: 'StatusCell',
        cellRendererParams: { ready, delayed },
      },
      {
        headerName: t('Transaction'),
        field: 'txHash',
        type: 'rightAligned',
        cellRendererSelector: ({
          data,
        }: VegaICellRendererParams<WithdrawalFieldsFragment>) => ({
          component: data?.txHash ? 'BlockExplorerLinkCell' : 'CompleteCell',
        }),
      },
    ],
    [delayed, ready, t]
  );
  return (
    <AgGrid
      overlayNoRowsTemplate={t('No withdrawals')}
      columnDefs={columnDefs}
      defaultColDef={COL_DEFS.default}
      components={{
        RecipientCell,
        StatusCell,
        BlockExplorerLinkCell,
        CompleteCell,
      }}
      suppressCellFocus
      {...props}
    />
  );
};

export type CompleteCellProps = {
  data: WithdrawalFieldsFragment;
};
export const CompleteCell = ({ data }: CompleteCellProps) => {
  const t = useT();

  const { config } = useEthereumConfig();
  const { configs } = useEVMBridgeConfigs();

  const open = useWithdrawalApprovalDialog((state) => state.open);
  const ref = useRef<HTMLButtonElement>(null);

  const { data: approvalData } = useWithdrawalApprovalQuery({
    variables: {
      withdrawalId: data.id,
    },
    skip: !data.id,
  });

  const { submitWithdraw } = useEvmWithdraw();

  const complete = async () => {
    if (!data || !approvalData?.erc20WithdrawalApproval) {
      return;
    }

    if (!config || !configs) {
      throw new Error('no evm configs');
    }

    if (data.asset.source.__typename !== 'ERC20') {
      throw new Error('asset not erc20');
    }

    const cfg = [config, ...configs].find(
      // @ts-ignore asset checked for erc20 above
      (c) => c.chain_id === data.asset.source.chainId
    );

    if (!cfg) {
      throw new Error('could not determine bridge config');
    }

    submitWithdraw({
      bridgeAddress: cfg.collateral_bridge_contract.address as `0x${string}`,
      asset: data.asset,
      approval: approvalData.erc20WithdrawalApproval,
    });
  };

  if (!data) {
    return null;
  }

  return data.pendingOnForeignChain ? (
    '-'
  ) : (
    <div className="flex justify-end gap-1">
      <ButtonLink
        data-testid="complete-withdrawal"
        onClick={() => complete()}
        disabled={!data || !approvalData?.erc20WithdrawalApproval}
      >
        {t('Complete withdrawal')}
      </ButtonLink>

      <ActionsDropdown>
        <TradingDropdownItem
          key={'withdrawal-approval'}
          data-testid="withdrawal-approval"
          onClick={() => {
            if (data.id) {
              open(data.id, ref.current, false);
            }
          }}
        >
          <VegaIcon name={VegaIconNames.BREAKDOWN} size={16} />
          {t('View withdrawal details')}
        </TradingDropdownItem>
      </ActionsDropdown>
    </div>
  );
};

export const BlockExplorerLinkCell = ({
  value,
  data,
}: VegaValueFormatterParams<WithdrawalFieldsFragment, 'txHash'>) => {
  if (!value) return '-';

  const assetChainId =
    data?.asset.source.__typename === 'ERC20'
      ? Number(data.asset.source.chainId)
      : undefined;

  return (
    <BlockExplorerLink
      sourceChainId={assetChainId}
      tx={value}
      data-testid="block-explorer-link"
    >
      {truncateByChars(value)}
    </BlockExplorerLink>
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
  const t = useT();
  const READY_TO_COMPLETE = t('Ready to complete');
  const PENDING = t('Pending');
  const COMPLETED = t('Completed');
  const REJECTED = t('Rejected');
  const FAILED = t('Failed');

  const isPending = data.pendingOnForeignChain || !data.txHash;
  const isReady = ready?.find((w) => w.data.id === data.id);
  const isDelayed = delayed?.find((w) => w.data.id === data.id);

  const determineLabel = () => {
    if (isPending && data.status !== Schema.WithdrawalStatus.STATUS_REJECTED) {
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
        setLabel(
          t('Delayed (ready in {{readyIn}})', {
            readyIn: convertToCountdownString(remaining, '0:00:00:00'),
          })
        );
      } else {
        setLabel(READY_TO_COMPLETE);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [READY_TO_COMPLETE, data, delayed, isDelayed, isPending, t]);

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
  data,
}: VegaICellRendererParams<
  WithdrawalFieldsFragment,
  'details.receiverAddress'
>) => {
  const assetChainId =
    data?.asset.source.__typename === 'ERC20'
      ? Number(data.asset.source.chainId)
      : undefined;

  return (
    <BlockExplorerLink
      sourceChainId={assetChainId}
      address={value}
      data-testid="block-explorer-link"
    >
      {valueFormatted}
    </BlockExplorerLink>
  );
};
