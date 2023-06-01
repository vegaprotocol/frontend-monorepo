import { t } from '@vegaprotocol/i18n';
import type * as Schema from '@vegaprotocol/types';
import type { FilterChangedEvent } from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useRef, useState } from 'react';
import { subDays, formatRFC3339 } from 'date-fns';
import { useLedgerEntriesDataProvider } from './ledger-entries-data-provider';
import { LedgerTable } from './ledger-table';
import type * as Types from '@vegaprotocol/types';
import { LedgerExportLink } from './ledger-export-link';
import { DataGridNoRowsOverlay } from '@vegaprotocol/datagrid';

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

  const { data, error, reload } = useLedgerEntriesDataProvider({
    partyId,
    filter,
    gridRef,
  });

  const onFilterChanged = useCallback((event: FilterChangedEvent) => {
    const updatedFilter = { ...defaultFilter, ...event.api.getFilterModel() };
    setFilter(updatedFilter);
  }, []);

  // allow passing undefined to grid so that loading state is shown
  const extractedData = data?.map((item) => item.node);

  return (
    <div className="h-full relative">
      <LedgerTable
        ref={gridRef}
        rowData={extractedData}
        onFilterChanged={onFilterChanged}
        noRowsOverlayComponent={() => (
          <DataGridNoRowsOverlay
            error={error}
            message={t('No entries')}
            reload={reload}
          />
        )}
      />
      {extractedData && (
        <LedgerExportLink entries={extractedData} partyId={partyId} />
      )}
    </div>
  );
};
