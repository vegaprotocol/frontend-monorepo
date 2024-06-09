import compact from 'lodash/compact';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApolloClient } from '@apollo/client';
import {
  PositionsV2Document,
  type PositionFieldsV2Fragment,
  type PositionsV2Query,
  type PositionsV2QueryVariables,
} from './__generated__/Positions';
import { type MarketLookup } from './use-markets';

export type Position = PositionFieldsV2Fragment;

export const usePositions = ({ partyId }: { partyId: string }) => {
  const queryClient = useQueryClient();
  const client = useApolloClient();
  const queryResult = useQuery({
    queryKey: ['positions', partyId],
    queryFn: async () => {
      const result = await client.query<
        PositionsV2Query,
        PositionsV2QueryVariables
      >({
        query: PositionsV2Document,
        fetchPolicy: 'no-cache',
        variables: {
          partyIds: [partyId],
        },
      });

      if (!result.data.positions?.edges?.length) {
        return [];
      }

      const markets = queryClient.getQueryData<MarketLookup>(['markets']);

      const positions = result.data.positions.edges.map((e) => {
        const position = e.node;

        if (!markets) return null;

        const market = markets.get(position.market.id);

        if (!market) return null;

        return {
          ...position,
          market: {
            decimalPlaces: market.decimalPlaces,
            positionDecimalPlaces: market.positionDecimalPlaces,
            tradableInstrument: {
              instrument: {
                code: market.tradableInstrument.instrument.code,
              },
            },
          },
        };
      });

      return compact(positions);
    },
  });

  return queryResult;
};
