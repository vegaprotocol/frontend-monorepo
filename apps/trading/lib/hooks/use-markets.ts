import { useQuery } from '@tanstack/react-query';
import { useApolloClient } from '@apollo/client';
import {
  MarketsDocument,
  type MarketsQuery,
  type MarketsQueryVariables,
} from '@vegaprotocol/markets';

export const useMarkets = () => {
  const client = useApolloClient();
  const queryResult = useQuery({
    queryKey: ['markets'],
    queryFn: async () => {
      const result = await client.query<MarketsQuery, MarketsQueryVariables>({
        query: MarketsDocument,
      });

      const markets = new Map();

      if (!result.data.marketsConnection?.edges.length) {
        return markets;
      }

      for (const edge of result.data.marketsConnection.edges) {
        const m = edge.node;
        markets.set(m.id, m);
      }

      return markets;
    },
  });

  return queryResult;
};
