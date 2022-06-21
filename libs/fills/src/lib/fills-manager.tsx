import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { useMemo, useRef } from 'react';
import { Fills } from './fills';
import type { Fills as FillsResult } from './__generated__/Fills';
import type { FillsVariables } from './__generated__/Fills';
import { gql, useQuery } from '@apollo/client';

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

interface FillsManagerProps {
  partyId: string;
}

export const FillsManager = ({ partyId }: FillsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo<FillsVariables>(() => ({ partyId }), [partyId]);
  const { data, loading, error } = useQuery<FillsResult>(FILLS_QUERY, {
    variables,
  });
  console.log(data);
  const fills = useMemo(() => {
    if (!data?.party?.tradesPaged.edges.length) {
      return [];
    }

    return data.party.tradesPaged.edges.map((edge) => edge.node);
  }, [data]);

  return (
    <AsyncRenderer data={data} error={error} loading={loading}>
      <Fills ref={gridRef} fills={fills} partyId={partyId} />
    </AsyncRenderer>
  );
};
