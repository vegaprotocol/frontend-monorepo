import {
  addDecimalsFormatNumber,
  DateRangeFilter,
  fromNanoSeconds,
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
          field="senderPartyId"
          cellRenderer={({
            value,
          }: VegaValueFormatterParams<LedgerEntry, 'senderPartyId'>) =>
            truncateByChars(value || '')
          }
        />
        <AgGridColumn
          headerName={t('Account type')}
          filter={SetFilter}
          filterParams={{
            set: AccountTypeMapping,
          }}
          field="senderAccountType"
          cellRenderer={({
            value,
          }: VegaValueFormatterParams<LedgerEntry, 'senderAccountType'>) =>
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
          field="receiverPartyId"
          cellRenderer={({
            value,
          }: VegaValueFormatterParams<LedgerEntry, 'receiverPartyId'>) =>
            truncateByChars(value || '')
          }
        />
        <AgGridColumn
          headerName={t('Account type')}
          filter={SetFilter}
          filterParams={{
            set: AccountTypeMapping,
          }}
          field="receiverAccountType"
          cellRenderer={({
            value,
          }: VegaValueFormatterParams<LedgerEntry, 'receiverAccountType'>) =>
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
          headerName={t('Transfer Type')}
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
          headerName={t('Vega Time')}
          field="vegaTime"
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<LedgerEntry, 'vegaTime'>) =>
            value ? getDateTimeFormat().format(fromNanoSeconds(value)) : '-'
          }
          filter={DateRangeFilter}
        />
      </AgGrid>
    );
  }
);
