import {
  addDecimalsFormatNumber,
  fromNanoSeconds,
  getDateTimeFormat,
  t,
} from '@vegaprotocol/react-helpers';
import type { VegaValueFormatterParams } from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import {
  AccountTypeMapping,
  DescriptionTransferTypeMapping,
  TransferTypeMapping,
} from '@vegaprotocol/types';
import type { LedgerEntry } from './ledger-entries-data-provider';
import type { ITooltipParams } from 'ag-grid-community';

export const TransferTooltipCellComponent = ({ value }: ITooltipParams) => {
  return (
    <p className="max-w-sm bg-neutral-200 px-4 py-2 z-20 rounded text-sm break-word text-black">
      {value
        ? DescriptionTransferTypeMapping[
            value as keyof typeof TransferTypeMapping
          ]
        : ''}
    </p>
  );
};

export const LedgerTable = ({ ...props }) => (
  <AgGrid
    style={{ width: '100%', height: '100%' }}
    overlayNoRowsTemplate={t('No entries')}
    rowHeight={34}
    getRowId={({ data }) => data.id}
    tooltipShowDelay={500}
    defaultColDef={{
      flex: 1,
      resizable: true,
      sortable: true,
      tooltipComponent: TransferTooltipCellComponent,
    }}
    {...props}
  >
    <AgGridColumn
      headerName={t('Account Type')}
      field="accountType"
      valueFormatter={({
        value,
      }: VegaValueFormatterParams<LedgerEntry, 'accountType'>) =>
        value
          ? AccountTypeMapping[value as keyof typeof AccountTypeMapping]
          : ''
      }
    />
    <AgGridColumn
      headerName={t('Transfer Type')}
      field="transferType"
      tooltipField="transferType"
      valueFormatter={({
        value,
      }: VegaValueFormatterParams<LedgerEntry, 'transferType'>) =>
        value
          ? TransferTypeMapping[value as keyof typeof TransferTypeMapping]
          : ''
      }
    />
    <AgGridColumn
      headerName={t('Quantity')}
      field="quantity"
      valueFormatter={({
        value,
        data,
      }: VegaValueFormatterParams<LedgerEntry, 'quantity'>) => {
        const marketDecimalPlaces = data?.market?.decimalPlaces;
        const assetDecimalPlaces = data?.asset?.decimals || 0;
        return value
          ? addDecimalsFormatNumber(
              value,
              assetDecimalPlaces,
              marketDecimalPlaces
            )
          : value;
      }}
    />
    <AgGridColumn
      headerName={t('Asset')}
      field="assetId"
      valueFormatter={({
        value,
        data,
      }: VegaValueFormatterParams<LedgerEntry, 'asset'>) =>
        data?.asset?.symbol || value
      }
    />
    <AgGridColumn
      headerName={t('Market')}
      field="marketId"
      valueFormatter={({
        data,
      }: VegaValueFormatterParams<LedgerEntry, 'market'>) =>
        data?.market?.tradableInstrument.instrument.code || '-'
      }
    />
    <AgGridColumn
      headerName={t('Vega Time')}
      field="vegaTime"
      valueFormatter={({ value }: { value: string }) =>
        getDateTimeFormat().format(fromNanoSeconds(value))
      }
      filter="agDateColumnFilter"
      filterParams={{
        comparator: (
          filterLocalDateAtMidnight: number,
          dateAsString: string
        ) => {
          if (dateAsString == null) {
            return 0;
          }
          const filterDate = new Date(filterLocalDateAtMidnight)
            .getTime()
            .toString();
          if (dateAsString < filterDate) {
            return -1;
          } else if (dateAsString > filterDate) {
            return 1;
          }
          return 0;
        },
      }}
    />
  </AgGrid>
);
