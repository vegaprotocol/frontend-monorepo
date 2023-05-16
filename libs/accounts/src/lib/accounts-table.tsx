import { forwardRef, useCallback, useMemo, useState } from 'react';
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
import {
  Button,
  ButtonLink,
  Dialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { TooltipCellComponent } from '@vegaprotocol/ui-toolkit';
import {
  AgGridLazy as AgGrid,
  CenteredGridCellWrapper,
} from '@vegaprotocol/datagrid';
import { AgGridColumn } from 'ag-grid-react';
import type {
  IDatasource,
  IGetRowsParams,
  RowHeightParams,
  RowNode,
} from 'ag-grid-community';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import BreakdownTable from './breakdown-table';
import type { AccountFields } from './accounts-data-provider';
import type { Asset } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import classNames from 'classnames';

const colorClass = (percentageUsed: number, neutral = false) => {
  return classNames({
    'text-neutral-500 dark:text-neutral-400': percentageUsed < 75 && !neutral,
    'text-vega-orange': percentageUsed >= 75 && percentageUsed < 90,
    'text-vega-pink': percentageUsed >= 90,
  });
};

export const percentageValue = (part?: string, total?: string) =>
  new BigNumber(part || 0)
    .dividedBy(total || 1)
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
  isReadOnly: boolean;
  pinnedAsset?: PinnedAsset;
  storeKey?: string;
}

export const AccountTable = forwardRef<AgGridReact, AccountTableProps>(
  ({ onClickAsset, onClickWithdraw, onClickDeposit, ...props }, ref) => {
    const [openBreakdown, setOpenBreakdown] = useState(false);
    const [row, setRow] = useState<AccountFields>();
    const pinnedAssetId = props.pinnedAsset?.id;

    const pinnedAssetRow = useMemo(() => {
      const currentPinnedAssetRow = props.rowData?.find(
        (row) => row.asset.id === pinnedAssetId
      );
      if (!currentPinnedAssetRow) {
        if (props.pinnedAsset) {
          return {
            asset: props.pinnedAsset,
            available: '0',
            used: '0',
            total: '0',
            balance: '0',
          };
        }
      }
      return currentPinnedAssetRow;
    }, [pinnedAssetId, props.pinnedAsset, props.rowData]);

    const { getRowHeight } = props;

    const getPinnedAssetRowHeight = useCallback(
      (params: RowHeightParams) => {
        if (
          params.node.rowPinned &&
          params.data.asset.id === pinnedAssetId &&
          new BigNumber(params.data.total).isLessThanOrEqualTo(0)
        ) {
          return 32;
        }
        return getRowHeight ? getRowHeight(params) : undefined;
      },
      [pinnedAssetId, getRowHeight]
    );

    return (
      <>
        <AgGrid
          {...props}
          style={{ width: '100%', height: '100%' }}
          overlayNoRowsTemplate={t('No accounts')}
          getRowId={({ data }: { data: AccountFields }) => data.asset.id}
          ref={ref}
          tooltipShowDelay={500}
          rowData={props.rowData?.filter(
            (data) => data.asset.id !== pinnedAssetId
          )}
          defaultColDef={{
            resizable: true,
            tooltipComponent: TooltipCellComponent,
            sortable: true,
            comparator: accountValuesComparator,
          }}
          getRowHeight={getPinnedAssetRowHeight}
          pinnedTopRowData={pinnedAssetRow ? [pinnedAssetRow] : undefined}
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
                      setOpenBreakdown(!openBreakdown);
                      setRow(data);
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
          {
            <AgGridColumn
              colId="accounts-actions"
              headerName=""
              sortable={false}
              maxWidth={200}
              type="rightAligned"
              cellRenderer={({
                data,
              }: VegaICellRendererParams<AccountFields>) => {
                if (!data) return null;
                else {
                  if (
                    data.asset.id === pinnedAssetId &&
                    new BigNumber(data.total).isLessThanOrEqualTo(0)
                  ) {
                    return (
                      <CenteredGridCellWrapper className="h-[30px] justify-end py-1">
                        <Button
                          size="xs"
                          variant="primary"
                          data-testid="deposit"
                          onClick={() => {
                            onClickDeposit && onClickDeposit(data.asset.id);
                          }}
                        >
                          {t('Deposit to trade')}
                        </Button>
                      </CenteredGridCellWrapper>
                    );
                  }
                  return (
                    !props.isReadOnly && (
                      <DropdownMenu
                        trigger={
                          <DropdownMenuTrigger
                            iconName="more"
                            className="hover:bg-vega-light-200 dark:hover:bg-vega-dark-200 p-0.5 focus:rounded-full hover:rounded-full"
                            data-testid="dropdown-menu"
                          ></DropdownMenuTrigger>
                        }
                      >
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            key={'deposit'}
                            data-testid="deposit"
                            onClick={() => {
                              onClickDeposit && onClickDeposit(data.asset.id);
                            }}
                          >
                            <span className="flex gap-2">
                              <VegaIcon
                                name={VegaIconNames.DEPOSIT}
                                size={16}
                              />
                              {t('Deposit')}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            key={'withdraw'}
                            data-testid="withdraw"
                            onClick={() =>
                              onClickWithdraw && onClickWithdraw(data.asset.id)
                            }
                          >
                            <span className="flex gap-2">
                              <VegaIcon
                                name={VegaIconNames.WITHDRAW}
                                size={16}
                              />
                              {t('Withdraw')}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            key={'breakdown'}
                            data-testid="breakdown"
                            onClick={() => {
                              setOpenBreakdown(!openBreakdown);
                              setRow(data);
                            }}
                          >
                            <span className="flex gap-2">
                              <VegaIcon
                                name={VegaIconNames.BREAKDOWN}
                                size={16}
                              />
                              {t('Breakdown')}
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  );
                }
              }}
              flex={1}
            />
          }
        </AgGrid>
        <Dialog size="medium" open={openBreakdown} onChange={setOpenBreakdown}>
          <div
            className="h-[35vh] w-full m-auto flex flex-col"
            data-testid="usage-breakdown"
          >
            <h1 className="text-xl mb-4">
              {row?.asset?.symbol} {t('usage breakdown')}
            </h1>
            {row && (
              <p className="mb-2 text-sm">
                {t('You have %s %s in total.', [
                  addDecimalsFormatNumber(row.total, row.asset.decimals),
                  row.asset.symbol,
                ])}
              </p>
            )}
            <BreakdownTable
              data={row?.breakdown || null}
              domLayout="autoHeight"
            />
          </div>
        </Dialog>
      </>
    );
  }
);
