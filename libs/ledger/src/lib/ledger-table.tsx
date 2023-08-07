import {
  addDecimalsFormatNumber,
  fromNanoSeconds,
  getDateTimeFormat,
  truncateByChars,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type {
  VegaValueFormatterParams,
  TypedDataAgGrid,
} from '@vegaprotocol/datagrid';
import {
  AgGridLazy as AgGrid,
  DateRangeFilter,
  SetFilter,
} from '@vegaprotocol/datagrid';
import type * as Types from '@vegaprotocol/types';
import type { ColDef } from 'ag-grid-community';
import {
  AccountTypeMapping,
  DescriptionTransferTypeMapping,
  TransferTypeMapping,
} from '@vegaprotocol/types';
import type { LedgerEntry } from './ledger-entries-data-provider';
import { useMemo } from 'react';
import { formatRFC3339, subDays } from 'date-fns';

export const TransferTooltipCellComponent = ({
  value,
}: {
  value: Types.TransferType;
}) => {
  return (
    <p className="max-w-sm px-4 py-2 z-20 rounded text-sm break-word">
      {value ? DescriptionTransferTypeMapping[value] : ''}
    </p>
  );
};

const defaultValue = { start: formatRFC3339(subDays(Date.now(), 7)) };
const dateRangeFilterParams = {
  maxNextDays: 0,
  defaultValue,
};
type LedgerEntryProps = TypedDataAgGrid<LedgerEntry>;

export const LedgerTable = (props: LedgerEntryProps) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: t('Sender'),
        field: 'fromAccountPartyId',
        cellRenderer: ({
          value,
        }: VegaValueFormatterParams<LedgerEntry, 'fromAccountPartyId'>) =>
          truncateByChars(value || ''),
      },
      {
        headerName: t('Account type'),
        filter: SetFilter,
        filterParams: {
          set: AccountTypeMapping,
        },
        field: 'fromAccountType',
        cellRenderer: ({
          value,
        }: VegaValueFormatterParams<LedgerEntry, 'fromAccountType'>) =>
          value ? AccountTypeMapping[value] : '-',
      },
      {
        headerName: t('Market'),
        field: 'marketSender.tradableInstrument.instrument.code',
        cellRenderer: ({
          value,
        }: VegaValueFormatterParams<
          LedgerEntry,
          'marketSender.tradableInstrument.instrument.code'
        >) => value || '-',
      },
      {
        headerName: t('Receiver'),
        field: 'toAccountPartyId',
        cellRenderer: ({
          value,
        }: VegaValueFormatterParams<LedgerEntry, 'toAccountPartyId'>) =>
          truncateByChars(value || ''),
      },
      {
        headerName: t('Account type'),
        filter: SetFilter,
        filterParams: {
          set: AccountTypeMapping,
        },
        field: 'toAccountType',
        cellRenderer: ({
          value,
        }: VegaValueFormatterParams<LedgerEntry, 'toAccountType'>) =>
          value ? AccountTypeMapping[value] : '-',
      },
      {
        headerName: t('Market'),
        field: 'marketReceiver.tradableInstrument.instrument.code',
        cellRenderer: ({
          value,
        }: VegaValueFormatterParams<
          LedgerEntry,
          'marketReceiver.tradableInstrument.instrument.code'
        >) => value || '-',
      },
      {
        headerName: t('Transfer type'),
        field: 'transferType',
        tooltipField: 'transferType',
        filter: SetFilter,
        filterParams: {
          set: TransferTypeMapping,
        },
        valueFormatter: ({
          value,
        }: VegaValueFormatterParams<LedgerEntry, 'transferType'>) =>
          value ? TransferTypeMapping[value] : '',
      },
      {
        headerName: t('Quantity'),
        field: 'quantity',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<LedgerEntry, 'quantity'>) => {
          const assetDecimalPlaces = data?.asset?.decimals || 0;
          return value
            ? addDecimalsFormatNumber(value, assetDecimalPlaces)
            : '';
        },
      },
      {
        headerName: t('Asset'),
        field: 'assetId',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<LedgerEntry, 'asset'>) =>
          data?.asset?.symbol || '',
      },
      {
        headerName: t('Sender account balance'),
        field: 'fromAccountBalance',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<LedgerEntry, 'fromAccountBalance'>) => {
          const assetDecimalPlaces = data?.asset?.decimals || 0;
          return value
            ? addDecimalsFormatNumber(value, assetDecimalPlaces)
            : '';
        },
      },
      {
        headerName: t('Receiver account balance'),
        field: 'toAccountBalance',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<LedgerEntry, 'toAccountBalance'>) => {
          const assetDecimalPlaces = data?.asset?.decimals || 0;
          return value
            ? addDecimalsFormatNumber(value, assetDecimalPlaces)
            : '';
        },
      },
      {
        headerName: t('Vega time'),
        field: 'vegaTime',
        valueFormatter: ({
          value,
        }: VegaValueFormatterParams<LedgerEntry, 'vegaTime'>) =>
          value ? getDateTimeFormat().format(fromNanoSeconds(value)) : '-',
        filterParams: dateRangeFilterParams,
        filter: DateRangeFilter,
      },
    ],
    []
  );
  return (
    <AgGrid
      tooltipShowDelay={500}
      defaultColDef={{
        sortable: true,
        tooltipComponent: TransferTooltipCellComponent,
        filterParams: {
          ...dateRangeFilterParams,
          buttons: ['reset'],
        },
      }}
      columnDefs={columnDefs}
      {...props}
    />
  );
};
