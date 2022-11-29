import { t } from '@vegaprotocol/react-helpers';
import type { Schema } from '@vegaprotocol/types';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type {
  BodyScrollEndEvent,
  BodyScrollEvent,
  FilterChangedEvent,
} from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';
import { useRef, useState } from 'react';
import { useLedgerEntriesDataProvider } from './ledger-entries-data-provider';
import { LedgerTable } from './ledger-table';

export interface Filter {
  vegaTime?: {
    value: Schema.DateRange;
  };
}

type LedgerManagerProps = { partyId: string };
export const LedgerManager = ({ partyId }: LedgerManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const scrolledToTop = useRef(true);
  const [filter, setFilter] = useState<Filter | undefined>();

  const { data, error, loading, addNewRows, getRows } =
    useLedgerEntriesDataProvider({
      partyId,
      filter,
      gridRef,
      scrolledToTop,
    });

  const onBodyScrollEnd = (event: BodyScrollEndEvent) => {
    if (event.top === 0) {
      addNewRows();
    }
  };

  const onBodyScroll = (event: BodyScrollEvent) => {
    scrolledToTop.current = event.top <= 0;
  };

  const onFilterChanged = (event: FilterChangedEvent) => {
    const updatedFilter = event.api.getFilterModel();
    if (Object.keys(updatedFilter).length) {
      setFilter(updatedFilter);
    } else if (filter) {
      setFilter(undefined);
    }
  };

  return (
    <>
      <LedgerTable
        ref={gridRef}
        rowModelType="infinite"
        datasource={{ getRows }}
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
        onFilterChanged={onFilterChanged}
      />
      <div className="pointer-events-none absolute inset-0 top-5">
        <AsyncRenderer
          loading={loading}
          error={error}
          data={data}
          noDataMessage={t('No entries')}
          noDataCondition={(data) => !(data && data.length)}
        />
      </div>
    </>
  );
};
