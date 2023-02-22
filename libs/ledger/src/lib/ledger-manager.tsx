import { t } from '@vegaprotocol/react-helpers';
import type * as Schema from '@vegaprotocol/types';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { FilterChangedEvent } from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useRef, useState } from 'react';
import { subDays, formatRFC3339 } from 'date-fns';
import type { AggregatedLedgerEntriesNode } from './ledger-entries-data-provider';
import { useLedgerEntriesDataProvider } from './ledger-entries-data-provider';
import { LedgerTable } from './ledger-table';
import type * as Types from '@vegaprotocol/types';

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
export const LedgerManager = ({ partyId }: { partyId: string }) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const [filter, setFilter] = useState<Filter>(defaultFilter);

  const { data, error, loading, reload } = useLedgerEntriesDataProvider({
    partyId,
    filter,
    gridRef,
  });

  const onFilterChanged = useCallback((event: FilterChangedEvent) => {
    const updatedFilter = { ...defaultFilter, ...event.api.getFilterModel() };
    setFilter(updatedFilter);
  }, []);
  const extractNodesDecorator = useCallback(
    (data: AggregatedLedgerEntriesNode[] | null) =>
      data ? data.map((item) => item.node) : null,
    []
  );
  const extractedData = extractNodesDecorator(data);

  return (
    <div className="h-full relative">
      <LedgerTable
        ref={gridRef}
        rowData={extractedData}
        onFilterChanged={onFilterChanged}
      />
      <div className="pointer-events-none absolute inset-0">
        <AsyncRenderer
          loading={loading}
          error={error}
          data={data}
          noDataMessage={t('No entries')}
          noDataCondition={(data) => !(data && data.length)}
          reload={reload}
        />
      </div>
    </div>
  );
};
