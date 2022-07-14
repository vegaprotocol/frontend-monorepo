import { useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { MarketListTable } from './market-list-table';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import type { AgGridReact } from 'ag-grid-react';
import type { IGetRowsParams } from 'ag-grid-community';
import type {
  Markets_markets,
  Markets_markets_data,
} from '../../components/__generated__/Markets';
import { marketsDataProvider as dataProvider } from './markets-data-provider';
import { MarketState } from '@vegaprotocol/types';

export const MarketsContainer = () => {
  const { push } = useRouter();
  const gridRef = useRef<AgGridReact | null>(null);
  const dataRef = useRef<Markets_markets[] | null>(null);
  const update = useCallback(({ data }: { data: Markets_markets[] }) => {
    if (!gridRef.current?.api) {
      return false;
    }
    dataRef.current = data;
    gridRef.current.api.refreshInfiniteCache();
    return true;
  }, []);
  const { data, error, loading } = useDataProvider<
    Markets_markets[],
    Markets_markets_data
  >({ dataProvider, update });
  dataRef.current = data;
  const getRows = async ({
    successCallback,
    startRow,
    endRow,
  }: IGetRowsParams) => {
    const rowsThisBlock = dataRef.current
      ? dataRef.current
          .slice(startRow, endRow)
          .filter((m) => m.data?.market.state !== MarketState.Rejected)
      : [];
    const lastRow = dataRef.current?.length ?? -1;
    successCallback(rowsThisBlock, lastRow);
  };

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <MarketListTable
        datasource={{ getRows }}
        ref={gridRef}
        onRowClicked={(id) => {
          push(`/markets/${id}`);
        }}
      />
    </AsyncRenderer>
  );
};
