import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useRef, useMemo } from 'react';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { FillsTable } from './fills-table';
import type { IGetRowsParams } from 'ag-grid-community';

import { fillsDataProvider as dataProvider } from './fills-data-provider';
import type { Fills_party_tradesPaged_edges } from './__generated__/Fills';
import type { FillsSub_trades } from './__generated__/FillsSub';

interface FillsManagerProps {
  partyId: string;
}

export const FillsManager = ({ partyId }: FillsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const dataRef = useRef<Fills_party_tradesPaged_edges[] | null>(null);
  const totalCountRef = useRef<number | undefined>(undefined);

  const update = useCallback(
    ({ data }: { data: Fills_party_tradesPaged_edges[] }) => {
      if (!gridRef.current?.api) {
        return false;
      }
      dataRef.current = data;
      gridRef.current.api.refreshInfiniteCache();
      return true;
    },
    []
  );

  const insert = useCallback(
    ({
      data,
      totalCount,
    }: {
      data: Fills_party_tradesPaged_edges[];
      totalCount?: number;
    }) => {
      dataRef.current = data;
      console.log('insert', data)
      totalCountRef.current = totalCount;
      return true;
    },
    []
  );

  const variables = useMemo(() => ({ partyId }), [partyId]);

  const { data, error, loading, load, totalCount } = useDataProvider<
    Fills_party_tradesPaged_edges[],
    FillsSub_trades[]
  >({ dataProvider, update, insert, variables });
  totalCountRef.current = totalCount;
  dataRef.current = data;

  const getRows = async ({
    successCallback,
    failCallback,
    startRow,
    endRow,
  }: IGetRowsParams) => {
    console.log('getRows', startRow, ':', endRow)
    try {
      if (dataRef.current && dataRef.current.length < endRow) {
        console.log('load');
        await load({
          first: endRow - startRow,
          after: dataRef.current[dataRef.current.length - 1].cursor,
        });
      }
      const rowsThisBlock = dataRef.current
        ? dataRef.current.slice(startRow, endRow).map((edge) => edge.node)
        : [];
      let lastRow = -1;
      if (totalCountRef.current !== undefined) {
        if (!totalCountRef.current) {
          lastRow = 0;
        } else {
          lastRow = totalCountRef.current;
        }
      }
      console.log('successCallback');
      successCallback(rowsThisBlock, lastRow);
    } catch (e) {
      failCallback();
    }
  };

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <FillsTable ref={gridRef} partyId={partyId} datasource={{ getRows }} />
    </AsyncRenderer>
  );
};
