import { t } from '@vegaprotocol/i18n';
import type * as Schema from '@vegaprotocol/types';
import type { FilterChangedEvent } from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useRef, useState, useMemo } from 'react';
import { subDays, formatRFC3339 } from 'date-fns';
import { ledgerEntriesProvider } from './ledger-entries-data-provider';
import type { LedgerEntriesQueryVariables } from './__generated__/LedgerEntries';
import { LedgerTable } from './ledger-table';
import { useDataProvider } from '@vegaprotocol/data-provider';
import type * as Types from '@vegaprotocol/types';
import { LedgerExportLink } from './ledger-export-link';
import type { useDataGridEvents } from '@vegaprotocol/datagrid';

export interface Filter {
  vegaTime?: {
    value: Schema.DateRange;
  };
  fromAccountType?: { value: Types.AccountType[] };
  toAccountType?: { value: Types.AccountType[] };
}
const defaultFilter = {
  vegaTime: {
    value: { start: formatRFC3339(subDays(Date.now(), 7)) },
  },
};

export const LedgerManager = ({
  partyId,
  gridProps,
}: {
  partyId: string;
  gridProps: ReturnType<typeof useDataGridEvents>;
}) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const [filter, setFilter] = useState<Filter>(defaultFilter);

  const variables = useMemo<LedgerEntriesQueryVariables>(
    () => ({
      partyId,
      dateRange: filter?.vegaTime?.value,
      pagination: {
        first: 10,
      },
    }),
    [partyId, filter?.vegaTime?.value]
  );

  const { data, error } = useDataProvider({
    dataProvider: ledgerEntriesProvider,
    variables,
    skip: !variables.partyId,
  });

  const onFilterChanged = useCallback(
    (event: FilterChangedEvent) => {
      const updatedFilter = { ...defaultFilter, ...event.api.getFilterModel() };
      setFilter(updatedFilter);
      gridProps.onFilterChanged(event);
    },
    [gridProps]
  );

  return (
    <div className="h-full relative">
      <LedgerTable
        ref={gridRef}
        rowData={data}
        overlayNoRowsTemplate={error ? error.message : t('No entries')}
        {...gridProps}
        onFilterChanged={onFilterChanged}
      />
      {data && <LedgerExportLink entries={data} partyId={partyId} />}
    </div>
  );
};
