import {
  addDecimalsFormatNumber,
  DateRangeFilter,
  fromISONanoSeconds,
  getDateTimeFormat,
  SetFilter,
  t,
  truncateByChars,
} from '@vegaprotocol/react-helpers';
import type {
  VegaValueFormatterParams,
  TypedDataAgGrid,
} from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import type * as Types from '@vegaprotocol/types';
import {
  AccountTypeMapping,
  DescriptionTransferTypeMapping,
  TransferTypeMapping,
} from '@vegaprotocol/types';
import type { LedgerEntry } from './ledger-entries-data-provider';
import { forwardRef } from 'react';

export const TransferTooltipCellComponent = ({
  value,
}: {
  value: Types.TransferType;
}) => {
  return (
    <p className="max-w-sm bg-neutral-200 px-4 py-2 z-20 rounded text-sm break-word text-black">
      {value ? DescriptionTransferTypeMapping[value] : ''}
    </p>
  );
};

type LedgerEntryProps = TypedDataAgGrid<LedgerEntry>;

export const LedgerTable = forwardRef<AgGridReact, LedgerEntryProps>(
  (props, ref) => {
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No entries')}
        ref={ref}
        getRowId={({ data }) => data.id}
        tooltipShowDelay={500}
        defaultColDef={{
          flex: 1,
          resizable: true,
          sortable: true,
          tooltipComponent: TransferTooltipCellComponent,
          filterParams: { buttons: ['reset'] },
        }}
        {...props}
      >
        <AgGridColumn
          headerName={t('Sender')}
          field="fromAccountPartyId"
          cellRenderer={({
            value,
          }: VegaValueFormatterParams<LedgerEntry, 'fromAccountPartyId'>) =>
            truncateByChars(value || '')
          }
        />
        <AgGridColumn
          headerName={t('Account type')}
          filter={SetFilter}
          filterParams={{
            set: AccountTypeMapping,
          }}
          field="fromAccountType"
          cellRenderer={({
            value,
          }: VegaValueFormatterParams<LedgerEntry, 'fromAccountType'>) =>
            value ? AccountTypeMapping[value] : '-'
          }
        />
        <AgGridColumn
          headerName={t('Market')}
          field="marketSender.tradableInstrument.instrument.code"
          cellRenderer={({
            value,
          }: VegaValueFormatterParams<
            LedgerEntry,
            'marketSender.tradableInstrument.instrument.code'
          >) => value || '-'}
        />
        <AgGridColumn
          headerName={t('Receiver')}
          field="toAccountPartyId"
          cellRenderer={({
            value,
          }: VegaValueFormatterParams<LedgerEntry, 'toAccountPartyId'>) =>
            truncateByChars(value || '')
          }
        />
        <AgGridColumn
          headerName={t('Account type')}
          filter={SetFilter}
          filterParams={{
            set: AccountTypeMapping,
          }}
          field="toAccountType"
          cellRenderer={({
            value,
          }: VegaValueFormatterParams<LedgerEntry, 'toAccountType'>) =>
            value ? AccountTypeMapping[value] : '-'
          }
        />
        <AgGridColumn
          headerName={t('Market')}
          field="marketReceiver.tradableInstrument.instrument.code"
          cellRenderer={({
            value,
          }: VegaValueFormatterParams<
            LedgerEntry,
            'marketReceiver.tradableInstrument.instrument.code'
          >) => value || '-'}
        />
        <AgGridColumn
          headerName={t('Transfer type')}
          field="transferType"
          tooltipField="transferType"
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<LedgerEntry, 'transferType'>) =>
            value ? TransferTypeMapping[value] : ''
          }
        />
        <AgGridColumn
          headerName={t('Quantity')}
          field="quantity"
          valueFormatter={({
            value,
            data,
          }: VegaValueFormatterParams<LedgerEntry, 'quantity'>) => {
            const marketDecimalPlaces = data?.marketSender?.decimalPlaces;
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
          headerName={t('Sender account balance')}
          field="fromAccountBalance"
          valueFormatter={({
            value,
            data,
          }: VegaValueFormatterParams<LedgerEntry, 'fromAccountBalance'>) => {
            const marketDecimalPlaces = data?.marketSender?.decimalPlaces;
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
          headerName={t('Receiver account balance')}
          field="toAccountBalance"
          valueFormatter={({
            value,
            data,
          }: VegaValueFormatterParams<LedgerEntry, 'toAccountBalance'>) => {
            const marketDecimalPlaces = data?.marketReceiver?.decimalPlaces;
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
          headerName={t('Vega time')}
          field="vegaTime"
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<LedgerEntry, 'vegaTime'>) =>
            value ? getDateTimeFormat().format(fromISONanoSeconds(value)) : '-'
          }
          filter={DateRangeFilter}
        />
      </AgGrid>
    );
  }
);
