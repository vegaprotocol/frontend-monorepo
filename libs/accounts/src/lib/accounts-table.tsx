import { forwardRef, useMemo, useState } from 'react';
import {
  addDecimal,
  addDecimalsFormatNumber,
  isNumeric,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/datagrid';
import { Button, ButtonLink, Dialog } from '@vegaprotocol/ui-toolkit';
import { TooltipCellComponent } from '@vegaprotocol/ui-toolkit';
import {
  AgGridDynamic as AgGrid,
  CenteredGridCellWrapper,
} from '@vegaprotocol/datagrid';
import { AgGridColumn } from 'ag-grid-react';
import type { IDatasource, IGetRowsParams } from 'ag-grid-community';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import BreakdownTable from './breakdown-table';
import type { AccountFields } from './accounts-data-provider';
import type { Asset } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import classNames from 'classnames';

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
      return undefined;
    }, [pinnedAssetId, props.pinnedAsset, props.rowData]);

    return (
      <>
        <AgGrid
          style={{ width: '100%', height: '100%' }}
          overlayNoRowsTemplate={t('No accounts')}
          getRowId={({ data }: { data: AccountFields }) => data.asset.id}
          ref={ref}
          tooltipShowDelay={500}
          defaultColDef={{
            flex: 1,
            resizable: true,
            tooltipComponent: TooltipCellComponent,
            sortable: true,
            comparator: (valueA, valueB, nodeA, nodeB) => {
              const a = addDecimal(valueA, nodeA.data.asset?.decimals);
              const b = addDecimal(valueB, nodeB.data.asset?.decimals);
              if (a === b) return 0;
              return a > b ? 1 : -1;
            },
          }}
          {...props}
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
              node,
            }: VegaICellRendererParams<AccountFields, 'asset.symbol'>) => {
              return value ? (
                <CenteredGridCellWrapper
                  className={node.rowPinned ? 'h-[30px]' : undefined}
                >
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
                </CenteredGridCellWrapper>
              ) : null;
            }}
            maxWidth={300}
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
              const percentageUsed = new BigNumber(value || 0)
                .dividedBy(data.total || 1)
                .multipliedBy(100)
                .toNumber();

              const colorClass = (percentageUsed: number) => {
                return classNames({
                  'text-neutral-500 dark:text-neutral-400': percentageUsed < 75,
                  'text-vega-orange':
                    percentageUsed >= 75 && percentageUsed < 90,
                  'text-vega-pink': percentageUsed >= 90,
                });
              };

              return data.breakdown ? (
                <>
                  <ButtonLink
                    data-testid="breakdown"
                    onClick={() => {
                      setOpenBreakdown(!openBreakdown);
                      setRow(data);
                    }}
                  >
                    <span className="">
                      {' '}
                      {data &&
                        data.asset &&
                        isNumeric(value) &&
                        addDecimalsFormatNumber(value, data.asset.decimals)}
                    </span>
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
                  <span>
                    {data &&
                      data.asset &&
                      isNumeric(value) &&
                      addDecimalsFormatNumber(value, data.asset.decimals)}
                  </span>
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
              'Deposited on the network, but not allocated to a market. Free for use in new markets or orders.'
            )}
            cellRenderer={({
              value,
              data,
            }: VegaICellRendererParams<AccountFields, 'available'>) => {
              const percentageUsed = new BigNumber(data?.used || 0)
                .dividedBy(data?.total || 1)
                .multipliedBy(100)
                .toNumber();
              const colorClass = (percentageUsed: number) => {
                return classNames({
                  'text-vega-orange':
                    percentageUsed >= 75 && percentageUsed < 90,
                  'text-vega-pink': percentageUsed >= 90,
                });
              };

              return (
                <span className={colorClass(percentageUsed)}>
                  {data &&
                    data.asset &&
                    isNumeric(value) &&
                    addDecimalsFormatNumber(value, data.asset.decimals)}
                </span>
              );
            }}
          />
          <AgGridColumn
            headerName={t('Total')}
            type="rightAligned"
            field="total"
            headerTooltip={t(
              'The full amount associated with this key. Total of used and available collateral.'
            )}
            valueFormatter={({
              value,
              data,
            }: VegaValueFormatterParams<AccountFields, 'total'>) =>
              data &&
              data.asset &&
              isNumeric(value) &&
              addDecimalsFormatNumber(value, data.asset.decimals)
            }
          />
          {
            <AgGridColumn
              colId="accounts-actions"
              headerName=""
              sortable={false}
              minWidth={200}
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
                      <ButtonLink
                        data-testid="deposit"
                        onClick={() => {
                          onClickDeposit && onClickDeposit(data.asset.id);
                        }}
                      >
                        {t('Deposit to trade')}
                      </ButtonLink>
                    );
                  }
                  return (
                    <>
                      <span className="mx-1" />
                      {!props.isReadOnly && (
                        <ButtonLink
                          data-testid="deposit"
                          onClick={() => {
                            onClickDeposit && onClickDeposit(data.asset.id);
                          }}
                        >
                          {t('Deposit')}
                        </ButtonLink>
                      )}
                      <span className="mx-1" />
                      {!props.isReadOnly && (
                        <ButtonLink
                          data-testid="withdraw"
                          onClick={() =>
                            onClickWithdraw && onClickWithdraw(data.asset.id)
                          }
                        >
                          {t('Withdraw')}
                        </ButtonLink>
                      )}
                    </>
                  );
                }
              }}
            />
          }
        </AgGrid>
        <Dialog size="medium" open={openBreakdown} onChange={setOpenBreakdown}>
          <div className="h-[35vh] w-full m-auto flex flex-col">
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
