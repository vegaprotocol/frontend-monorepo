import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useRef, useMemo } from 'react';
import {
  useDataProvider,
  makeInfiniteScrollGetRows,
} from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { FillsTable } from './fills-table';
import type { BodyScrollEvent, BodyScrollEndEvent } from 'ag-grid-community';
import type { Schema } from '@vegaprotocol/types';

import { fillsDataProvider as dataProvider } from './fills-data-provider';
import type { FillFieldsFragment } from './__generated__/Fills';

type FillsTradeEdge = Pick<Schema.TradeEdge, '__typename' | 'cursor'> & {
  node: FillFieldsFragment,
};

interface FillsManagerProps {
  partyId: string;
}

export const FillsManager = ({ partyId }: FillsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const dataRef = useRef<(FillsTradeEdge | null)[] | null>(
    null
  );
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
      data: (FillsTradeEdge | null)[];
      delta: FillFieldsFragment[];
    }) => {
      if (!gridRef.current?.api) {
        return false;
      }
      if (!scrolledToTop.current) {
        const createdAt = dataRef.current?.[0]?.node.createdAt;
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
      data: (FillsTradeEdge | null)[];
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
    (FillsTradeEdge | null)[],
    FillFieldsFragment[]
  >({ dataProvider, update, insert, variables });
  totalCountRef.current = totalCount;
  dataRef.current = data;

  const getRows = makeInfiniteScrollGetRows<FillsTradeEdge>(
    newRows,
    dataRef,
    totalCountRef,
    load
  );

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
        rowModelType="infinite"
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
      />
    </AsyncRenderer>
  );
};
