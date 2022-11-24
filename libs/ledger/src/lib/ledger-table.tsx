import {
  addDecimalsFormatNumber,
  fromNanoSeconds,
  getDateTimeFormat,
  t,
  truncateByChars,
} from '@vegaprotocol/react-helpers';
import type {
  VegaValueFormatterParams,
  VegaICellRendererParams,
} from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { Schema as Types } from '@vegaprotocol/types';
import {
  AccountTypeMapping,
  DescriptionTransferTypeMapping,
  TransferTypeMapping,
} from '@vegaprotocol/types';
import type { LedgerEntry } from './ledger-entries-data-provider';

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
      <div className="flex">{`${t('Account')}: ${truncateByChars(
        partyId || '-'
      )}`}</div>
      <div className="flex">{`${t('Account type')}: ${
        accountType ? AccountTypeMapping[accountType] : '-'
      }`}</div>
      <div className="flex">{`${t('Market')}: ${marketName || '-'}`}</div>
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

export const LedgerTable = ({ ...props }) => (
  <AgGrid
    style={{ width: '100%', height: '100%' }}
    overlayNoRowsTemplate={t('No entries')}
    rowHeight={70}
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
      valueFormatter={({ value }: { value?: string }) =>
        value ? getDateTimeFormat().format(fromNanoSeconds(value)) : '-'
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
