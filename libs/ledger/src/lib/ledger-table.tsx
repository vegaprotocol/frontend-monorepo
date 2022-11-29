import {
  addDecimalsFormatNumber,
  DateRangeFilter,
  fromNanoSeconds,
  getDateTimeFormat,
  t,
  truncateByChars,
} from '@vegaprotocol/react-helpers';
import type {
  VegaValueFormatterParams,
  VegaICellRendererParams,
  TypedDataAgGrid,
} from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import type { Schema as Types } from '@vegaprotocol/types';
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

type LedgerCellRendererProps = {
  accountType?: Types.AccountType | null;
  partyId?: string | null;
  marketName?: string;
};

const LedgerCellRenderer = ({
  accountType,
  partyId,
  marketName,
}: LedgerCellRendererProps) => {
  return (
    <div className="flex flex-col justify-around leading-5 h-full">
      <div
        className="flex"
        title={`${t('ID')}: ${truncateByChars(partyId || '-')}`}
      >
        {truncateByChars(partyId || '')}
      </div>
      <div
        className="flex"
        title={`${t('Account type')}: ${
          accountType ? AccountTypeMapping[accountType] : '-'
        }`}
      >
        {accountType && AccountTypeMapping[accountType]}
      </div>
      <div className="flex" title={`${t('Market')}: ${marketName || '-'}`}>
        {marketName}
      </div>
    </div>
  );
};
const SenderCellRenderer = ({ data }: VegaICellRendererParams<LedgerEntry>) => {
  const props = {
    accountType: data?.senderAccountType,
    partyId: data?.senderPartyId,
    marketName: data?.marketSender?.tradableInstrument?.instrument?.code,
  };
  return <LedgerCellRenderer {...props} />;
};
const ReceiverCellRenderer = ({
  data,
}: VegaICellRendererParams<LedgerEntry>) => {
  const props = {
    accountType: data?.receiverAccountType,
    partyId: data?.receiverPartyId,
    marketName: data?.marketReceiver?.tradableInstrument?.instrument?.code,
  };
  return <LedgerCellRenderer {...props} />;
};

type LedgerEntryProps = TypedDataAgGrid<LedgerEntry>;

export const LedgerTable = forwardRef<AgGridReact, LedgerEntryProps>(
  (props, ref) => {
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No entries')}
        rowHeight={70}
        ref={ref}
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
          headerName={t('Sender')}
          field="senderAccountType"
          cellRenderer={SenderCellRenderer}
        />
        <AgGridColumn
          headerName={t('Receiver')}
          field="receiverAccountType"
          cellRenderer={ReceiverCellRenderer}
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
