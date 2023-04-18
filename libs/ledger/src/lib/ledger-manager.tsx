import { useEnvironment } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import type * as Schema from '@vegaprotocol/types';
import { AsyncRenderer, Link } from '@vegaprotocol/ui-toolkit';
import type { FilterChangedEvent } from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { subDays, formatRFC3339 } from 'date-fns';
import type { AggregatedLedgerEntriesNode } from './ledger-entries-data-provider';
import { useLedgerEntriesDataProvider } from './ledger-entries-data-provider';
import { LedgerTable } from './ledger-table';
import type * as Types from '@vegaprotocol/types';

const getProtoHost = (vegaurl: string) => {
  const loc = new URL(vegaurl);
  return `${loc.protocol}//${loc.host}`;
};
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
  const [dataCount, setDataCount] = useState(0);

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
    (data: AggregatedLedgerEntriesNode[] | null, loading: boolean) =>
      data && !loading ? data.map((item) => item.node) : null,
    []
  );

  const extractedData = extractNodesDecorator(data, loading);
  useEffect(() => {
    setDataCount(gridRef.current?.api?.getModel().getRowCount() ?? 0);
  }, [extractedData]);
  const VEGA_URL = useEnvironment((store) => store.VEGA_URL);
  const protohost = VEGA_URL ? getProtoHost(VEGA_URL) : '';

  return (
    <div className="h-full relative">
      {protohost && (
        <Link
          className="h-[30px] text-sm p-2"
          title={t('Download all to .csv file')}
          href={`${protohost}/api/v2/ledgerentry/export?partyId=${partyId}`}
        >
          {t('Export all to .csv file')}
        </Link>
      )}
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
          noDataCondition={() => !dataCount}
          reload={reload}
        />
      </div>
    </div>
  );
};
