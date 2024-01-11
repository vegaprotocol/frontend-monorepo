import { useMemo, useCallback } from 'react';
import {
  addDecimalsFormatNumber,
  addDecimalsFormatNumberQuantum,
  isNumeric,
  toBigNum,
} from '@vegaprotocol/utils';
import { useT } from './use-t';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/datagrid';
import { COL_DEFS } from '@vegaprotocol/datagrid';
import {
  Intent,
  TradingButton,
  VegaIcon,
  VegaIconNames,
  TooltipCellComponent,
} from '@vegaprotocol/ui-toolkit';
import { AgGrid } from '@vegaprotocol/datagrid';
import type {
  IGetRowsParams,
  IRowNode,
  RowHeightParams,
  ColDef,
} from 'ag-grid-community';
import type { AgGridReactProps } from 'ag-grid-react';
import type { AccountFields } from './accounts-data-provider';
import type { Asset } from '@vegaprotocol/types';
import { CenteredGridCellWrapper } from '@vegaprotocol/datagrid';
import BigNumber from 'bignumber.js';
import classNames from 'classnames';
import { AccountsActionsDropdown } from './accounts-actions-dropdown';

const colorClass = (percentageUsed: number) => {
  return classNames('text-right', {
    'text-vega-orange': percentageUsed >= 75 && percentageUsed < 90,
    'text-vega-red': percentageUsed >= 90,
  });
};

export const percentageValue = (part: string, total: string) => {
  total = !total || total === '0' ? '1' : total;
  return new BigNumber(part).dividedBy(total).multipliedBy(100).toNumber();
};

export const accountValuesComparator = (
  valueA: string,
  valueB: string,
  nodeA: IRowNode,
  nodeB: IRowNode
) => {
  if (isNumeric(valueA) && isNumeric(valueB)) {
    const a = toBigNum(valueA, nodeA.data.asset?.decimals);
    const b = toBigNum(valueB, nodeB.data.asset?.decimals);

    if (a.isEqualTo(b)) return 0;
    return a.isGreaterThan(b) ? 1 : -1;
  }
  if (valueA === valueB) return 0;
  return valueA > valueB ? 1 : -1;
};

const defaultColDef = {
  resizable: true,
  sortable: true,
  tooltipComponent: TooltipCellComponent,
  comparator: accountValuesComparator,
  minWidth: 150,
};
export interface GetRowsParams extends Omit<IGetRowsParams, 'successCallback'> {
  successCallback(rowsThisBlock: AccountFields[], lastRow?: number): void;
}

export type PinnedAsset = Pick<Asset, 'symbol' | 'name' | 'id' | 'decimals'>;

export interface AccountTableProps extends AgGridReactProps {
  rowData?: AccountFields[] | null;
  onClickAsset: (assetId: string) => void;
  onClickWithdraw?: (assetId: string) => void;
  onClickDeposit?: (assetId: string) => void;
  onClickBreakdown?: (assetId: string) => void;
  onClickTransfer?: (assetId: string) => void;
  isReadOnly: boolean;
  pinnedAsset?: PinnedAsset;
}

export const AccountTable = ({
  onClickAsset,
  onClickWithdraw,
  onClickDeposit,
  onClickBreakdown,
  onClickTransfer,
  rowData,
  isReadOnly,
  pinnedAsset,
  ...props
}: AccountTableProps) => {
  const t = useT();
  const pinnedRow = useMemo(() => {
    if (!pinnedAsset) {
      return;
    }
    const currentPinnedAssetRow = rowData?.find(
      (row) => row.asset.id === pinnedAsset?.id
    );
    if (!currentPinnedAssetRow) {
      return {
        asset: pinnedAsset,
        available: '0',
        used: '0',
        total: '0',
        balance: '0',
      };
    }
    return currentPinnedAssetRow;
  }, [pinnedAsset, rowData]);

  const { getRowHeight } = props;

  const getPinnedAssetRowHeight = useCallback(
    (params: RowHeightParams) => {
      if (
        params.node.rowPinned &&
        params.data.asset.id === pinnedAsset?.id &&
        new BigNumber(params.data.total).isLessThanOrEqualTo(0)
      ) {
        return 32;
      }
      return getRowHeight ? getRowHeight(params) : undefined;
    },
    [pinnedAsset?.id, getRowHeight]
  );

  const showDepositButton = pinnedRow?.balance === '0';

  const colDefs = useMemo(() => {
    const defs: ColDef[] = [
      {
        headerName: t('Asset'),
        field: 'asset.symbol',
        pinned: true,
        minWidth: 75,
        headerTooltip: t(
          'Asset is the collateral that is deposited into the Vega protocol.'
        ),
        cellClass: 'underline',
        onCellClicked: ({ data }) => {
          if (data) {
            onClickAsset(data.asset.id);
          }
        },
      },
      {
        headerName: t('Used'),
        type: 'rightAligned',
        field: 'used',
        headerTooltip: t(
          'Currently allocated to a market as margin or bond. Check the breakdown for details.'
        ),
        tooltipValueGetter: ({ value, data }) => {
          if (!value || !data) return null;
          return addDecimalsFormatNumber(value, data.asset.decimals);
        },
        onCellClicked: ({ data }) => {
          if (!data || !onClickBreakdown) return;
          onClickBreakdown(data.asset.id);
        },
        cellRenderer: ({
          data,
          value,
        }: VegaICellRendererParams<AccountFields, 'used'>) => {
          if (!value || !data) return '-';
          const percentageUsed = percentageValue(value, data.total);
          const valueFormatted = addDecimalsFormatNumberQuantum(
            value,
            data.asset.decimals,
            data.asset.quantum
          );

          return data.breakdown ? (
            <>
              <span className="underline">{valueFormatted}</span>
              <span
                className={classNames(
                  colorClass(percentageUsed),
                  'ml-1 inline-block w-14'
                )}
              >
                {percentageUsed.toFixed(2)}%
              </span>
            </>
          ) : (
            <>
              <span className="underline">{valueFormatted}</span>
              <span className="inline-block ml-2 w-14 text-muted">
                {(0).toFixed(2)}%
              </span>
            </>
          );
        },
      },
      {
        headerName: t('Available'),
        field: 'available',
        type: 'rightAligned',
        headerTooltip: t(
          'Deposited on the network, but not allocated to a market. Free to use for placing orders or providing liquidity.'
        ),
        tooltipValueGetter: ({ value, data }) => {
          if (!value || !data) return null;
          return addDecimalsFormatNumber(value, data.asset.decimals);
        },
        cellClass: ({ data }) => {
          const percentageUsed = percentageValue(data?.used, data?.total);
          return colorClass(percentageUsed);
        },
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<AccountFields, 'available'>) => {
          if (!value || !data) return '-';
          return addDecimalsFormatNumberQuantum(
            value,
            data.asset.decimals,
            data.asset.quantum
          );
        },
      },

      {
        headerName: t('Total'),
        type: 'rightAligned',
        field: 'total',
        headerTooltip: t(
          'The total amount of each asset on this key. Includes used and available collateral.'
        ),
        tooltipValueGetter: ({ value, data }) => {
          if (!value || !data) return null;
          return addDecimalsFormatNumber(value, data.asset.decimals);
        },
        valueFormatter: ({
          data,
          value,
        }: VegaValueFormatterParams<AccountFields, 'total'>) => {
          if (!data || !value) return '-';
          return addDecimalsFormatNumberQuantum(
            value,
            data.asset.decimals,
            data.asset.quantum
          );
        },
      },
      {
        colId: 'accounts-actions',
        field: 'asset.id',
        ...COL_DEFS.actions,
        minWidth: showDepositButton ? 105 : COL_DEFS.actions.minWidth,
        maxWidth: showDepositButton ? 105 : COL_DEFS.actions.maxWidth,
        cellRenderer: ({
          value: assetId,
          node,
        }: VegaICellRendererParams<AccountFields, 'asset.id'>) => {
          if (!assetId) return null;
          if (node.rowPinned && node.data?.balance === '0') {
            return (
              <CenteredGridCellWrapper className="h-[30px] justify-end py-1">
                <TradingButton
                  size="extra-small"
                  intent={Intent.Primary}
                  data-testid="deposit"
                  onClick={() => {
                    onClickDeposit && onClickDeposit(assetId);
                  }}
                >
                  <VegaIcon name={VegaIconNames.DEPOSIT} size={14} />{' '}
                  {t('Deposit')}
                </TradingButton>
              </CenteredGridCellWrapper>
            );
          }
          return isReadOnly ? null : (
            <AccountsActionsDropdown
              assetId={assetId}
              assetContractAddress={
                node.data?.asset.source?.__typename === 'ERC20'
                  ? node.data.asset.source.contractAddress
                  : undefined
              }
              onClickDeposit={() => {
                onClickDeposit && onClickDeposit(assetId);
              }}
              onClickWithdraw={() => {
                onClickWithdraw && onClickWithdraw(assetId);
              }}
              onClickBreakdown={() => {
                onClickBreakdown && onClickBreakdown(assetId);
              }}
              onClickTransfer={() => {
                onClickTransfer && onClickTransfer(assetId);
              }}
            />
          );
        },
      },
    ];
    return defs;
  }, [
    onClickAsset,
    onClickBreakdown,
    onClickDeposit,
    onClickWithdraw,
    onClickTransfer,
    isReadOnly,
    showDepositButton,
    t,
  ]);

  const data = rowData?.filter((data) => data.asset.id !== pinnedAsset?.id);
  return (
    <AgGrid
      {...props}
      getRowId={({ data }: { data: AccountFields }) => data.asset.id}
      tooltipShowDelay={500}
      rowData={data}
      defaultColDef={defaultColDef}
      columnDefs={colDefs}
      overlayNoRowsTemplate={
        // account for the pinned asset is filtered out to prevent duplicate
        // data in the pinned row and the main table rows. AgGrid will not
        // consider the pinned row when determining whether to show the no
        // rows template or not so we need to override it
        rowData?.length ? '<span />' : props.overlayNoRowsTemplate
      }
      getRowHeight={getPinnedAssetRowHeight}
      pinnedTopRowData={pinnedRow ? [pinnedRow] : undefined}
    />
  );
};
