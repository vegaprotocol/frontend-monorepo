import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef } from 'react';
import { Fills } from './fills';
import type { Fills as FillsResult } from './__generated__/Fills';
import type { FillsVariables } from './__generated__/Fills';
import { useApolloClient } from '@apollo/client';
import reverse from 'lodash/reverse';
import type { GridApi, IDatasource, IGetRowsParams } from 'ag-grid-community';
import { FILLS_QUERY } from './fills-data-provider';

const ROW_COUNT_PER_FETCH = 100;

interface FillsManagerProps {
  partyId: string;
}

export const FillsManager = ({ partyId }: FillsManagerProps) => {
  const cursorRef = useRef<{ start: string; end: string } | null>(null);
  const client = useApolloClient();
  const gridRef = useRef<AgGridReact | null>(null);

  const onBodyScrollEnd = useCallback(
    ({ api, top }: { api: GridApi; top: number }) => {
      // TODO: Refresh when back at top
      console.log('top', top);
    },
    []
  );

  const fillsDataSource = useMemo<IDatasource>(() => {
    return {
      getRows: async ({ successCallback, failCallback }: IGetRowsParams) => {
        try {
          if (!gridRef.current) {
            return;
          }
          const variables = {
            partyId,
            pagination: {
              before: cursorRef.current?.start,
              last: ROW_COUNT_PER_FETCH,
            },
          };

          const res = await client.query<FillsResult, FillsVariables>({
            query: FILLS_QUERY,
            variables,
            fetchPolicy: 'network-only',
          });

          if (!res.data.party?.tradesPaged.edges.length) return;

          const edges = reverse([...res.data.party.tradesPaged.edges]);

          cursorRef.current = {
            start: res.data.party.tradesPaged.pageInfo.startCursor,
            end: res.data.party.tradesPaged.pageInfo.endCursor,
          };

          successCallback(edges.map((e) => e.node));
        } catch (err) {
          failCallback();
        }
      },
    };
  }, [client, partyId]);

  return (
    <Fills
      ref={gridRef}
      datasource={fillsDataSource}
      partyId={partyId}
      onBodyScrollEnd={onBodyScrollEnd}
    />
  );
};
