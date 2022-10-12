import { makeDataProvider } from '@vegaprotocol/react-helpers';

import type {
  LiquidityProvisionMarkets as Markets,
  LiquidityProvisionMarkets_marketsConnection_edges_node as Market,
} from './__generated__';
import { LiquidityProvisionMarketsDocument } from './__generated___/MarketsLiquidity';

const getData = (responseData: Markets): Market[] | null => {
  return (
    responseData?.marketsConnection?.edges.map((edge) => {
      return edge.node;
    }) || null
  );
};

export const liquidityMarketsProvider = makeDataProvider<
  Markets,
  Market[],
  never,
  never
>({
  query: LiquidityProvisionMarketsDocument,
  getData,
});
