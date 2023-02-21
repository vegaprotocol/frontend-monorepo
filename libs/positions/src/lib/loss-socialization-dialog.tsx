import compact from 'lodash/compact';
import type { VegaValueFormatterParams } from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic, Dialog } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useMemo } from 'react';
import type { ArrayElement } from 'type-fest/source/exact';
import type { LossSocializationQuery } from './__generated__/LossSocialization';
import { useLossSocializationQuery } from './__generated__/LossSocialization';
import {
  getDateTimeFormat,
  t,
  truncateByChars,
} from '@vegaprotocol/react-helpers';
import { AgGridColumn } from 'ag-grid-react';
import { AccountTypeMapping, TransferTypeMapping } from '@vegaprotocol/types';

type Edge = NonNullable<
  ArrayElement<LossSocializationQuery['ledgerEntries']['edges']>
>;
type Entry = Edge['node'];

interface LossSocializationDialogProps {
  close: () => void;
  marketId: string | null;
}

export const LossSocializationDialog = ({
  marketId,
  close,
}: LossSocializationDialogProps) => {
  return (
    <Dialog open={Boolean(marketId)} onChange={() => close()} size="medium">
      {marketId && <Container marketId={marketId} />}
    </Dialog>
  );
};

const Container = ({ marketId }: { marketId: string }) => {
  const { pubKey } = useVegaWallet();
  const { data, loading, error } = useLossSocializationQuery({
    variables: {
      partyId: pubKey || '',
      marketId,
      pagination: {
        first: 1000, // TODO: use date range to get entries since market started
      },
    },
    skip: !pubKey || !marketId,
    fetchPolicy: 'network-only',
    context: {
      isEnlargedTimeout: true,
    },
  });

  const entries = useMemo(() => {
    if (loading) return undefined;
    if (!data?.ledgerEntries.edges) return [];
    return compact(data.ledgerEntries.edges).map((e) => e.node);
  }, [data, loading]);

  if (error) {
    return (
      <div>
        <h3>Failed to load entries</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return <Table entries={entries} />;
};

const Table = ({ entries }: { entries: Entry[] | undefined }) => {
  return (
    <AgGridDynamic
      overlayNoRowsTemplate={t('No entries')}
      overlayLoadingTemplate={t('Loading...')}
      rowData={entries}
      style={{ width: '100%', height: 400 }}
      defaultColDef={{
        flex: 1,
        resizable: true,
        sortable: true,
      }}
    >
      <AgGridColumn
        field="transferType"
        valueFormatter={({
          value,
        }: VegaValueFormatterParams<Entry, 'transferType'>) => {
          if (!value) return '-';
          return TransferTypeMapping[value];
        }}
      />
      <AgGridColumn
        field="fromAccountPartyId"
        valueFormatter={({
          value,
        }: VegaValueFormatterParams<Entry, 'fromAccountPartyId'>) => {
          if (!value) return '-';
          if (value === 'network') return 'network';
          return truncateByChars(value);
        }}
      />
      <AgGridColumn
        field="fromAccountType"
        valueFormatter={({
          value,
        }: VegaValueFormatterParams<Entry, 'fromAccountType'>) => {
          if (!value) return '-';
          return AccountTypeMapping[value];
        }}
      />
      <AgGridColumn
        field="toAccountPartyId"
        valueFormatter={({
          value,
        }: VegaValueFormatterParams<Entry, 'fromAccountPartyId'>) => {
          if (!value) return '-';
          if (value === 'network') return 'network';
          return truncateByChars(value);
        }}
      />
      <AgGridColumn
        field="toAccountType"
        valueFormatter={({
          value,
        }: VegaValueFormatterParams<Entry, 'toAccountType'>) => {
          if (!value) return '-';
          return AccountTypeMapping[value];
        }}
      />

      <AgGridColumn
        field="quantity"
        valueGetter={({ data }: any) => {
          return Number(data.quantity);
        }}
      />
      <AgGridColumn
        field="vegaTime"
        valueGetter={({ data }) => new Date(data.vegaTime)}
        valueFormatter={({
          value,
        }: VegaValueFormatterParams<Entry, 'vegaTime'>) => {
          console.log(value);
          if (!value) {
            return value;
          }
          return getDateTimeFormat().format(value);
        }}
      />
    </AgGridDynamic>
    // <table className="block table-fixed w-full text-xs">
    //   <thead>
    //     <tr>
    //       <th>amount</th>
    //       <th>transferType</th>
    //       <th>to party</th>
    //       <th>to type</th>
    //       <th>from party</th>
    //       <th>from type</th>
    //       <th>time</th>
    //     </tr>
    //   </thead>
    //   <tbody>
    //     {entries.map((entry) => (
    //       <tr>
    //         <td>{entry.quantity}</td>
    //         <td>{entry.transferType}</td>
    //         <td>
    //           {entry.toAccountPartyId === 'network'
    //             ? entry.toAccountPartyId
    //             : truncateByChars(entry.toAccountPartyId)}
    //         </td>
    //         <td>{entry.toAccountType}</td>
    //         <td>
    //           {entry.fromAccountPartyId === 'network'
    //             ? entry.fromAccountPartyId
    //             : truncateByChars(entry.fromAccountPartyId)}
    //         </td>
    //         <td>{entry.fromAccountType}</td>
    //         <td>{entry.vegaTime}</td>
    //       </tr>
    //     ))}
    //   </tbody>
    // </table>
  );
};
