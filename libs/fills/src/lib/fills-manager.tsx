import type { AgGridReact } from 'ag-grid-react';
import { useMemo, useRef } from 'react';
import { Fills } from './fills';
import type { Fills as FillsResult } from './__generated__/Fills';
import type { FillsVariables } from './__generated__/Fills';
import { gql, useApolloClient } from '@apollo/client';
import reverse from 'lodash/reverse';
import type { IDatasource, IGetRowsParams } from 'ag-grid-community';

const FILL_FRAGMENT = gql`
  fragment FillFields on Trade {
    id
    createdAt
    price
    size
    buyOrder
    sellOrder
    buyer {
      id
    }
    seller {
      id
    }
    market {
      id
      decimalPlaces
      tradableInstrument {
        instrument {
          id
          code
        }
      }
    }
  }
`;

const FILLS_QUERY = gql`
  ${FILL_FRAGMENT}
  query Fills($partyId: ID!, $marketId: ID, $pagination: Pagination) {
    party(id: $partyId) {
      id
      tradesPaged(marketId: $marketId, pagination: $pagination) {
        totalCount
        edges {
          node {
            ...FillFields
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
        }
      }
    }
  }
`;

const ROW_COUNT_PER_FETCH = 100;

interface FillsManagerProps {
  partyId: string;
}

export const FillsManager = ({ partyId }: FillsManagerProps) => {
  const oldestCursorRef = useRef<string | null>(null);
  const client = useApolloClient();
  const gridRef = useRef<AgGridReact | null>(null);
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
              before: oldestCursorRef.current,
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
          oldestCursorRef.current = edges[0].cursor;
          const lastRow = gridRef.current.api.getInfiniteRowCount();

          successCallback(
            edges.map((e) => e.node),
            lastRow && lastRow > 1 ? lastRow : undefined
          );
        } catch (err) {
          failCallback();
        }
      },
    };
  }, [client, partyId]);

  return <Fills ref={gridRef} dataSource={fillsDataSource} partyId={partyId} />;
};
