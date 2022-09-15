import type { CSSProperties } from 'react';
import { forwardRef } from 'react';
import type {
  CellRendererSelectorResult,
  GroupCellRendererParams,
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import {
  PriceCell,
  addDecimalsFormatNumber,
  t,
} from '@vegaprotocol/react-helpers';
import { Button, Intent } from '@vegaprotocol/ui-toolkit';
import { TooltipCellComponent } from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic as AgGrid, ProgressBar } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import type { AccountFieldsFragment } from './__generated__/Accounts';
import { getId } from './accounts-data-provider';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import type { AccountType } from '@vegaprotocol/types';
import { AccountTypeMapping } from '@vegaprotocol/types';

export interface PriceCellProps {
  valueFormatted?: {
    low: string;
    high: string;
    value: number;
    intent?: Intent;
  };
}

const EmptyCell = () => '';

export const ProgressBarCell = ({ valueFormatted }: PriceCellProps) => {
  return valueFormatted ? (
    <>
      <div className="flex justify-between leading-tight font-mono">
        <div>{valueFormatted.low}</div>
        <div>{valueFormatted.high}</div>
      </div>
      <ProgressBar
        value={valueFormatted.value}
        intent={valueFormatted.intent}
        className="mt-2"
      />
    </>
  ) : null;
};

interface AccountsTableProps extends AgGridReactProps {
  data: AccountFieldsFragment[] | null;
  style?: CSSProperties;
}

interface AccountsTableValueFormatterParams extends ValueFormatterParams {
  data: AccountFieldsFragment;
}

export const assetDecimalsFormatter = ({
  value,
  data,
}: AccountsTableValueFormatterParams) =>
  addDecimalsFormatNumber(value, data.asset.decimals);

export const AccountsTable = forwardRef<AgGridReact, AccountsTableProps>(
  ({ data }, ref) => {
    const { setAssetDetailsDialogOpen, setAssetDetailsDialogSymbol } =
      useAssetDetailsDialogStore();
    const assetDialogCellRenderer = ({ value }: GroupCellRendererParams) =>
      value && value.length > 0 ? (
        <button
          className="hover:underline"
          onClick={() => {
            setAssetDetailsDialogOpen(true);
            setAssetDetailsDialogSymbol(value);
          }}
        >
          {value}
        </button>
      ) : (
        ''
      );
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No accounts')}
        rowData={data}
        getRowId={({ data }) => getId(data)}
        ref={ref}
        rowHeight={34}
        components={{ PriceCell }}
        autoGroupColumnDef={{
          field: 'asset.symbol',
          headerName: t('Asset'),
          rowGroup: true,
          hide: true,
          cellRenderer: assetDialogCellRenderer,
        }}
        tooltipShowDelay={500}
        defaultColDef={{
          flex: 1,
          resizable: true,
          sortable: true,
          tooltipComponent: TooltipCellComponent,
        }}
      >
        <AgGridColumn
          headerName={t('Asset')}
          field="asset.symbol"
          headerTooltip={t(
            'Asset is the collateral that is deposited into the Vega protocol.'
          )}
        />
        <AgGridColumn
          headerName={t('Type')}
          field="type"
          valueFormatter={({ value }: ValueFormatterParams) =>
            value ? AccountTypeMapping[value as AccountType] : '-'
          }
          headerTooltip={t(
            'Type is the type of account that is used to deposit collateral.'
          )}
        />
        <AgGridColumn
          headerName={t('Used')}
          field="balance"
          headerComponentParams={{
            template:
              '<div class="ag-cell-label-container" role="presentation">' +
              `  <span>${t('Available')}</span>` +
              '  <span ref="eText" class="ag-header-cell-text"></span>' +
              '</div>',
          }}
          flex={2}
          cellRendererSelector={(
            params: ICellRendererParams
          ): CellRendererSelectorResult => {
            return {
              component: params.node.rowPinned ? EmptyCell : ProgressBarCell,
            };
          }}
          valueFormatter={({
            data,
            node,
          }: ValueFormatterParams):
            | PriceCellProps['valueFormatted']
            | undefined => {
            if (!data || node?.rowPinned) {
              return undefined;
            }
            const min = BigInt(data.balance);
            const max = BigInt(data.balance);
            const mid = BigInt(data.balance);
            const range = max - min;
            return {
              low: addDecimalsFormatNumber(min.toString(), data.asset.decimals),
              high: addDecimalsFormatNumber(
                max.toString(),
                data.asset.decimals
              ),
              value: range ? Number(((mid - min) * BigInt(100)) / range) : 0,
              intent: data.lowMarginLevel ? Intent.Warning : undefined,
            };
          }}
        />
        <AgGridColumn
          headerName={t('Deposited')}
          field="balance"
          cellRenderer="PriceCell"
          type="rightAligned"
          valueFormatter={assetDecimalsFormatter}
        />
        <AgGridColumn
          headerName={t('Used')}
          field="balance"
          cellRenderer="PriceCell"
          type="rightAligned"
          valueFormatter={assetDecimalsFormatter}
        />
        <AgGridColumn
          headerName={t('Balance')}
          field="balance"
          cellRenderer="PriceCell"
          type="rightAligned"
          valueFormatter={assetDecimalsFormatter}
        />
        <AgGridColumn
          headerName={t('Market')}
          field="market.tradableInstrument.instrument.name"
          valueFormatter="value || '—'"
        />
        <AgGridColumn
          field="close"
          cellRenderer={({ data }: ICellRendererParams) => {
            if (!data) return null;

            return (
              <Button size="xs" data-testid="close" onClick={() => null}>
                Close
              </Button>
            );
          }}
        />
      </AgGrid>
    );
  }
);

export default AccountsTable;
