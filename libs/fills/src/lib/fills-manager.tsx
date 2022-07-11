import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useRef, useMemo } from 'react';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { FillsTable } from './fills-table';
import type {
  IGetRowsParams,
  BodyScrollEvent,
  BodyScrollEndEvent,
} from 'ag-grid-community';

import { fillsDataProvider as dataProvider } from './fills-data-provider';
import type { Fills_party_tradesPaged_edges } from './__generated__/Fills';
import type { FillsSub_trades } from './__generated__/FillsSub';
import { generateFill } from './test-helpers';

interface FillsManagerProps {
  partyId: string;
}

export const FillsManager = ({ partyId }: FillsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const dataRef = useRef<Fills_party_tradesPaged_edges[] | null>(null);
  const totalCountRef = useRef<number | undefined>(undefined);
  const newRows = useRef(0);
  const scrolledToTop = useRef(true);

  const addNewRows = useCallback(() => {
    if (newRows.current === 0) {
      return;
    }
    if (totalCountRef.current !== undefined) {
      totalCountRef.current += newRows.current;
    }
    newRows.current = 0;
    if (!gridRef.current?.api) {
      return;
    }
    gridRef.current.api.refreshInfiniteCache();
  }, []);

  const update = useCallback(
    ({
      data,
      delta,
    }: {
      data: Fills_party_tradesPaged_edges[];
      delta: FillsSub_trades[];
    }) => {
      if (!gridRef.current?.api) {
        return false;
      }
      if (!scrolledToTop.current) {
        const createdAt = dataRef.current?.[0].node.createdAt;
        if (createdAt) {
          newRows.current += delta.filter(
            (trade) => trade.createdAt > createdAt
          ).length;
        }
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
    startRow: rawStartRow,
    endRow: rawEndRow,
  }: IGetRowsParams) => {
    const startRow = rawStartRow + newRows.current;
    const endRow = rawEndRow + newRows.current;
    try {
      if (
        dataRef.current &&
        dataRef.current.slice(startRow, endRow).some((i) => !i)
      ) {
        await load(startRow, endRow);
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
      successCallback(rowsThisBlock, lastRow);
    } catch (e) {
      failCallback();
    }
  };

  const onBodyScrollEnd = (event: BodyScrollEndEvent) => {
    if (event.top === 0) {
      addNewRows();
    }
  };

  const onBodyScroll = (event: BodyScrollEvent) => {
    scrolledToTop.current = event.top <= 0;
  };

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <FillsTable
        ref={gridRef}
        partyId={partyId}
        datasource={{ getRows }}
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
      />
    </AsyncRenderer>
  );
};
