import type {
  LiquidityProvisionMarkets_marketsConnection_edges_node,
  LiquidityProvisionMarkets_marketsConnection_edges_node_liquidityProvisionsConnection_edges,
} from './../__generated__';

export type LiquidityProvisionMarket =
  LiquidityProvisionMarkets_marketsConnection_edges_node;
export type LiquidityProvisionsEdge =
  LiquidityProvisionMarkets_marketsConnection_edges_node_liquidityProvisionsConnection_edges;

export const sumLiquidityCommitted = (edges: LiquidityProvisionsEdge[]) => {
  return edges
    ? edges.reduce(
        (
          total: number,
          { node: { commitmentAmount } }: { node: { commitmentAmount: string } }
        ) => {
          return total + parseInt(commitmentAmount, 10);
        },
        0
      )
    : 0;
};
