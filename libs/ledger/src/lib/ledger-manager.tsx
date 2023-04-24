import { useEnvironment } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import type * as Schema from '@vegaprotocol/types';
import {
  AsyncRenderer,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Link,
} from '@vegaprotocol/ui-toolkit';
import type { FilterChangedEvent } from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { subDays, formatRFC3339 } from 'date-fns';
import type {
  AggregatedLedgerEntriesNode,
  LedgerEntry,
} from './ledger-entries-data-provider';
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
const LedgerEntriesExportLink = ({
  partyId,
  entries,
}: {
  partyId: string;
  entries: LedgerEntry[];
}) => {
  const assets = entries.reduce((aggr, item) => {
    if (item.asset && !(item.asset.id in aggr)) {
      aggr[item.asset.id] = item.asset.symbol;
    }
    return aggr;
  }, {} as Record<string, string>);
  const [assetId, setAssetId] = useState(Object.keys(assets)[0]);
  const VEGA_URL = useEnvironment((store) => store.VEGA_URL);
  const protohost = VEGA_URL ? getProtoHost(VEGA_URL) : '';

  const assetDropDown = useMemo(() => {
    return (
      <DropdownMenu
        trigger={<DropdownMenuTrigger>{assets[assetId]}</DropdownMenuTrigger>}
      >
        <DropdownMenuContent>
          {Object.keys(assets).map((assetKey) => (
            <DropdownMenuItem
              key={assetKey}
              onSelect={() => setAssetId(assetKey)}
            >
              {assets[assetKey]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [assetId, assets]);

  if (!protohost) {
    return null;
  }
  return (
    <div className="flex shrink">
      {assetId ? (
        <Link
          className="h-[50px] text-sm p-2"
          title={t('Download all to .csv file')}
          href={`${protohost}/api/v2/ledgerentry/export?partyId=${partyId}&assetId=${assetId}`}
        >
          {t('Export all of')} {assetDropDown} {t('to .csv file')}
        </Link>
      ) : (
        <>{t('Select asset to export')}</>
      )}
    </div>
  );
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

  return (
    <div className="h-full relative">
      {extractedData && (
        <LedgerEntriesExportLink entries={extractedData} partyId={partyId} />
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
