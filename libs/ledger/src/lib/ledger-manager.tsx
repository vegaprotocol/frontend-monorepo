import { t } from '@vegaprotocol/react-helpers';
import type * as Schema from '@vegaprotocol/types';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { FilterChangedEvent } from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useRef, useState } from 'react';
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

type LedgerManagerProps = { partyId: string };
export const LedgerManager = ({ partyId }: LedgerManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const [filter, setFilter] = useState<Filter | undefined>();

  const { data, error, loading, getRows, reload } =
    useLedgerEntriesDataProvider({
      partyId,
      filter,
      gridRef,
    });

  const onFilterChanged = useCallback(
    (event: FilterChangedEvent) => {
      const updatedFilter = event.api.getFilterModel();
      if (Object.keys(updatedFilter).length) {
        setFilter(updatedFilter);
      } else if (filter) {
        setFilter(undefined);
      }
    },
    [filter]
  );
  const getRowId = useCallback(
    ({ data }: { data: Types.AggregatedLedgerEntry }) =>
      `${data.vegaTime}-${data.fromAccountPartyId}-${data.toAccountPartyId}`,
    []
  );
  return (
    <div className="h-full relative">
      <LedgerTable
        ref={gridRef}
        rowModelType="infinite"
        datasource={{ getRows }}
        onFilterChanged={onFilterChanged}
        getRowId={getRowId}
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
