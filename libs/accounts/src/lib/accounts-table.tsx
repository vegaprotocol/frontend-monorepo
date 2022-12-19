import { forwardRef, useState } from 'react';
import type { ValueFormatterParams } from 'ag-grid-community';
import {
  addDecimalsFormatNumber,
  isNumeric,
  t,
} from '@vegaprotocol/react-helpers';
import type {
  ValueProps,
  VegaICellRendererParams,
} from '@vegaprotocol/ui-toolkit';
import { Button, ButtonLink, Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { TooltipCellComponent } from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { IDatasource, IGetRowsParams } from 'ag-grid-community';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import type { VegaValueFormatterParams } from '@vegaprotocol/ui-toolkit';
import BreakdownTable from './breakdown-table';
import type { AccountFields } from './accounts-data-provider';

export const progressBarValueFormatter = ({
  data,
  node,
}: ValueFormatterParams): ValueProps['valueFormatted'] | undefined => {
  if (!data || node?.rowPinned) {
    return undefined;
  }
  const min = BigInt(data.used);
  const mid = BigInt(data.available);
  const max = BigInt(data.deposited);
  const range = max > min ? max : min;
  return {
    low: addDecimalsFormatNumber(min.toString(), data.asset.decimals, 4),
    high: addDecimalsFormatNumber(mid.toString(), data.asset.decimals, 4),
    value: range ? Number((min * BigInt(100)) / range) : 0,
    intent: Intent.Warning,
  };
};

export const progressBarHeaderComponentParams = {
  template:
    '<div class="ag-cell-label-container" role="presentation">' +
    `  <span>${t('Available')}</span>` +
    '  <span ref="eText" class="ag-header-cell-text"></span>' +
    '</div>',
};

export interface GetRowsParams extends Omit<IGetRowsParams, 'successCallback'> {
  successCallback(rowsThisBlock: AccountFields[], lastRow?: number): void;
}

export interface Datasource extends IDatasource {
  getRows(params: GetRowsParams): void;
}

export interface AccountTableProps extends AgGridReactProps {
  rowData?: AccountFields[] | null;
  datasource?: Datasource;
  onClickAsset: (assetId: string) => void;
  onClickWithdraw?: (assetId: string) => void;
  onClickDeposit?: (assetId: string) => void;
}

export const AccountTable = forwardRef<AgGridReact, AccountTableProps>(
  ({ onClickAsset, onClickWithdraw, onClickDeposit, ...props }, ref) => {
    const [openBreakdown, setOpenBreakdown] = useState(false);
    const [breakdown, setBreakdown] = useState<AccountFields[] | null>(null);
    return (
      <>
        <AgGrid
          style={{ width: '100%', height: '100%' }}
          overlayNoRowsTemplate={t('No accounts')}
          getRowId={({ data }: { data: AccountFields }) => data.asset.id}
          ref={ref}
          rowHeight={34}
          tooltipShowDelay={500}
          defaultColDef={{
            flex: 1,
            resizable: true,
            tooltipComponent: TooltipCellComponent,
            sortable: true,
          }}
          {...props}
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
              return value ? (
                <ButtonLink
                  data-testid="deposit"
                  onClick={() => {
                    if (data) {
                      onClickAsset(data.asset.id);
                    }
                  }}
                >
                  {value}
                </ButtonLink>
              ) : null;
            }}
            maxWidth={300}
          />
          <AgGridColumn
            headerName={t('Total')}
            field="deposited"
            headerTooltip={t(
              'This is the total amount of collateral used plus the amount available in your general account.'
            )}
            valueFormatter={({
              value,
              data,
            }: VegaValueFormatterParams<AccountFields, 'deposited'>) =>
              data &&
              data.asset &&
              isNumeric(value) &&
              addDecimalsFormatNumber(value, data.asset.decimals)
            }
            maxWidth={300}
          />
          <AgGridColumn
            headerName={t('Used')}
            field="used"
            headerTooltip={t(
              'This is the amount of collateral used from your general account.'
            )}
            valueFormatter={({
              value,
              data,
            }: VegaValueFormatterParams<AccountFields, 'used'>) =>
              data &&
              data.asset &&
              isNumeric(value) &&
              addDecimalsFormatNumber(value, data.asset.decimals)
            }
            maxWidth={300}
          />
          <AgGridColumn
            headerName={t('Available')}
            field="available"
            headerTooltip={t(
              'This is the amount of collateral available in your general account.'
            )}
            valueFormatter={({
              value,
              data,
            }: VegaValueFormatterParams<AccountFields, 'available'>) =>
              data &&
              data.asset &&
              isNumeric(value) &&
              addDecimalsFormatNumber(value, data.asset.decimals)
            }
            maxWidth={300}
          />
          <AgGridColumn
            headerName=""
            field="breakdown"
            minWidth={150}
            cellRenderer={({
              value,
            }: VegaICellRendererParams<AccountFields, 'breakdown'>) => {
              return (
                <ButtonLink
                  data-testid="breakdown"
                  onClick={() => {
                    setOpenBreakdown(!openBreakdown);
                    setBreakdown(value || null);
                  }}
                >
                  {t('Breakdown')}
                </ButtonLink>
              );
            }}
          />
          <AgGridColumn
            colId="transact"
            headerName=""
            sortable={false}
            minWidth={250}
            cellRenderer={({
              data,
            }: VegaICellRendererParams<AccountFields>) => {
              return data ? (
                <div className="flex gap-2 justify-end">
                  <Button
                    size="xs"
                    data-testid="deposit"
                    onClick={() => {
                      onClickDeposit && onClickDeposit(data.asset.id);
                    }}
                  >
                    {t('Deposit')}
                  </Button>

                  <Button
                    size="xs"
                    data-testid="withdraw"
                    onClick={() =>
                      onClickWithdraw && onClickWithdraw(data.asset.id)
                    }
                  >
                    {t('Withdraw')}
                  </Button>
                </div>
              ) : null;
            }}
          />
        </AgGrid>
        <Dialog size="medium" open={openBreakdown} onChange={setOpenBreakdown}>
          <div className="h-[35vh] w-full m-auto flex flex-col">
            <h1 className="text-xl mb-4">{t('Collateral breakdown')}</h1>
            <BreakdownTable data={breakdown} domLayout="autoHeight" />
          </div>
        </Dialog>
      </>
    );
  }
);
