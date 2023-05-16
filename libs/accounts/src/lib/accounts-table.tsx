import { forwardRef, useMemo, useCallback } from 'react';
import {
  addDecimalsFormatNumber,
  isNumeric,
  toBigNum,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/datagrid';
import { COL_DEFS } from '@vegaprotocol/datagrid';
import {
  ButtonLink,
  Button,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';

import { TooltipCellComponent } from '@vegaprotocol/ui-toolkit';
import { AgGridLazy as AgGrid } from '@vegaprotocol/datagrid';
import { AgGridColumn } from 'ag-grid-react';
import type {
  IDatasource,
  IGetRowsParams,
  RowNode,
  RowHeightParams,
} from 'ag-grid-community';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import type { AccountFields } from './accounts-data-provider';
import type { Asset } from '@vegaprotocol/types';
import { CenteredGridCellWrapper } from '@vegaprotocol/datagrid';
import BigNumber from 'bignumber.js';
import classNames from 'classnames';
import { AccountsActionsDropdown } from './accounts-actions-dropdown';

const colorClass = (percentageUsed: number, neutral = false) => {
  return classNames({
    'text-neutral-500 dark:text-neutral-400': percentageUsed < 75 && !neutral,
    'text-vega-orange': percentageUsed >= 75 && percentageUsed < 90,
    'text-vega-pink': percentageUsed >= 90,
  });
};

export const percentageValue = (part?: string, total?: string) =>
  new BigNumber(part || 0)
    .dividedBy(!total || total === '0' ? 1 : total)
    .multipliedBy(100)
    .toNumber();

const formatWithAssetDecimals = (
  data: AccountFields | undefined,
  value: string | undefined
) => {
  return (
    data &&
    data.asset &&
    isNumeric(value) &&
    addDecimalsFormatNumber(value, data.asset.decimals)
  );
};

export const accountValuesComparator = (
  valueA: string,
  valueB: string,
  nodeA: RowNode,
  nodeB: RowNode
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

export interface GetRowsParams extends Omit<IGetRowsParams, 'successCallback'> {
  successCallback(rowsThisBlock: AccountFields[], lastRow?: number): void;
}

export interface Datasource extends IDatasource {
  getRows(params: GetRowsParams): void;
}

export type PinnedAsset = Pick<Asset, 'symbol' | 'name' | 'id' | 'decimals'>;

export interface AccountTableProps extends AgGridReactProps {
  rowData?: AccountFields[] | null;
  datasource?: Datasource;
  onClickAsset: (assetId: string) => void;
  onClickWithdraw?: (assetId: string) => void;
  onClickDeposit?: (assetId: string) => void;
  onClickBreakdown?: (assetId: string) => void;
  isReadOnly: boolean;
  pinnedAsset?: PinnedAsset;
  storeKey?: string;
}

export const AccountTable = forwardRef<AgGridReact, AccountTableProps>(
  (
    {
      onClickAsset,
      onClickWithdraw,
      onClickDeposit,
      onClickBreakdown,
      rowData,
      ...props
    },
    ref
  ) => {
    const pinnedAsset = useMemo(() => {
      if (!props.pinnedAsset) {
        return;
      }
      const currentPinnedAssetRow = rowData?.find(
        (row) => row.asset.id === props.pinnedAsset?.id
      );
      if (!currentPinnedAssetRow) {
        return {
          asset: props.pinnedAsset,
          available: '0',
          used: '0',
          total: '0',
          balance: '0',
        };
      }
      return currentPinnedAssetRow;
    }, [props.pinnedAsset, rowData]);

    const { getRowHeight } = props;

    const getPinnedAssetRowHeight = useCallback(
      (params: RowHeightParams) => {
        if (
          params.node.rowPinned &&
          params.data.asset.id === props.pinnedAsset?.id &&
          new BigNumber(params.data.total).isLessThanOrEqualTo(0)
        ) {
          return 32;
        }
        return getRowHeight ? getRowHeight(params) : undefined;
      },
      [props.pinnedAsset?.id, getRowHeight]
    );

    const showDepositButton = pinnedAsset?.balance === '0';

    return (
      <AgGrid
        {...props}
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No accounts')}
        getRowId={({
          data,
        }: {
          data: AccountFields & { isLastPlaceholder?: boolean; id?: string };
        }) => (data.isLastPlaceholder && data.id ? data.id : data.asset.id)}
        ref={ref}
        tooltipShowDelay={500}
        rowData={rowData?.filter(
          (data) => data.asset.id !== props.pinnedAsset?.id
        )}
        defaultColDef={{
          resizable: true,
          tooltipComponent: TooltipCellComponent,
          sortable: true,
          comparator: accountValuesComparator,
        }}
        getRowHeight={getPinnedAssetRowHeight}
        pinnedTopRowData={pinnedAsset ? [pinnedAsset] : undefined}
      >
        <AgGridColumn
          headerName={t('Asset')}
          field="asset.symbol"
          headerTooltip={t(
            'Asset is the collateral that is deposited into the Vega protocol.'
          )}
          cellRenderer={({
            value,
            data,
          }: VegaICellRendererParams<AccountFields, 'asset.symbol'>) => {
            return (
              <ButtonLink
                data-testid="asset"
                onClick={() => {
                  if (data) {
                    onClickAsset(data.asset.id);
                  }
                }}
              >
                {value}
              </ButtonLink>
            );
          }}
        />
        <AgGridColumn
          headerName={t('Used')}
          type="rightAligned"
          field="used"
          headerTooltip={t(
            'Currently allocated to a market as margin or bond. Check the breakdown for details.'
          )}
          cellRenderer={({
            data,
            value,
          }: VegaICellRendererParams<AccountFields, 'used'>) => {
            if (!data) return null;
            const percentageUsed = percentageValue(value, data.total);
            const valueFormatted = formatWithAssetDecimals(data, value);

            return data.breakdown ? (
              <>
                <ButtonLink
                  data-testid="breakdown"
                  onClick={() => {
                    onClickBreakdown && onClickBreakdown(data.asset.id);
                  }}
                >
                  <span>{valueFormatted}</span>
                </ButtonLink>
                <span
                  className={classNames(
                    colorClass(percentageUsed),
                    'ml-2 inline-block w-14'
                  )}
                >
                  {percentageUsed.toFixed(2)}%
                </span>
              </>
            ) : (
              <>
                <span>{valueFormatted}</span>
                <span className="ml-2 inline-block w-14 text-neutral-500 dark:text-neutral-400">
                  0.00%
                </span>
              </>
            );
          }}
        />
        <AgGridColumn
          headerName={t('Available')}
          field="available"
          type="rightAligned"
          headerTooltip={t(
            'Deposited on the network, but not allocated to a market. Free to use for placing orders or providing liquidity.'
          )}
          cellRenderer={({
            value,
            data,
          }: VegaICellRendererParams<AccountFields, 'available'>) => {
            const percentageUsed = percentageValue(data?.used, data?.total);

            return (
              <span className={colorClass(percentageUsed, true)}>
                {formatWithAssetDecimals(data, value)}
              </span>
            );
          }}
        />
        <AgGridColumn
          headerName={t('Total')}
          type="rightAligned"
          field="total"
          headerTooltip={t(
            'The total amount of each asset on this key. Includes used and available collateral.'
          )}
          valueFormatter={({
            data,
          }: VegaValueFormatterParams<AccountFields, 'total'>) =>
            formatWithAssetDecimals(data, data?.total)
          }
        />
        <AgGridColumn
          colId="accounts-actions"
          field="asset.id"
          {...COL_DEFS.actions}
          minWidth={showDepositButton ? 130 : COL_DEFS.actions.minWidth}
          maxWidth={showDepositButton ? 130 : COL_DEFS.actions.maxWidth}
          cellRenderer={({
            value: assetId,
            node,
          }: VegaICellRendererParams<AccountFields, 'asset.id'>) => {
            if (!assetId) return null;
            if (node.rowPinned && node.data?.balance === '0') {
              return (
                <CenteredGridCellWrapper className="h-[30px] justify-end py-1">
                  <Button
                    size="xs"
                    variant="primary"
                    data-testid="deposit"
                    onClick={() => {
                      onClickDeposit && onClickDeposit(assetId);
                    }}
                  >
                    <VegaIcon name={VegaIconNames.DEPOSIT} /> {t('Deposit')}
                  </Button>
                </CenteredGridCellWrapper>
              );
            }
            return props.isReadOnly ? null : (
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
              />
            );
          }}
        />
      </AgGrid>
    );
  }
);
