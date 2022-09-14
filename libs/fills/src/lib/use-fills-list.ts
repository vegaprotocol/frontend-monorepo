import type { RefObject } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef } from 'react';
import type { Fills_party_tradesConnection_edges } from './__generated__/Fills';
import type { FillsSub_trades } from './__generated__/FillsSub';
import {
  makeInfiniteScrollGetRows,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import { fillsDataProvider as dataProvider } from './fills-data-provider';

interface Props {
  partyId: string;
  gridRef: RefObject<AgGridReact>;
  scrolledToTop: RefObject<boolean>;
}

export const useFillsList = ({ partyId, gridRef, scrolledToTop }: Props) => {
  const dataRef = useRef<(Fills_party_tradesConnection_edges | null)[] | null>(
    null
  );
  const totalCountRef = useRef<number | undefined>(undefined);
  const newRows = useRef(0);

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
      data: (Fills_party_tradesConnection_edges | null)[];
      delta: FillsSub_trades[];
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
      data: (Fills_party_tradesConnection_edges | null)[];
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
    (Fills_party_tradesConnection_edges | null)[],
    FillsSub_trades[]
  >({ dataProvider, update, insert, variables });
  totalCountRef.current = totalCount;
  dataRef.current = data;

  const getRows = makeInfiniteScrollGetRows<Fills_party_tradesConnection_edges>(
    newRows,
    dataRef,
    totalCountRef,
    load
  );
  return { data, error, loading, addNewRows, getRows };
};
