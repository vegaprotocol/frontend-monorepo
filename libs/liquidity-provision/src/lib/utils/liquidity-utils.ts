/* tslint:disable */
/* eslint-disable */

import type { Market } from '@vegaprotocol/market-list';
import { addDecimalsFormatNumber } from '@vegaprotocol/react-helpers';

export const formatWithAsset = (value: string, market: Market) => {
  const formattedValue = addDecimalsFormatNumber(
    value,
    market.tradableInstrument.instrument.product.settlementAsset.decimals
  );
  const asset =
    market.tradableInstrument.instrument.product.settlementAsset.symbol;
  return `${formattedValue} ${asset}`;
};

export const sumLiquidityCommitted = (edges = []) => {
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

// @ts-ignore
export const mapMarketLists = (markets) => {
  return markets.map((market = {}) => {
    // @ts-ignore
    console.log(market?.liquidityProvisionsConnection);
    //return market;
    return {
      ...market,
      liquidityCommitted: sumLiquidityCommitted(
        // @ts-ignore
        market?.liquidityProvisionsConnection?.edges
      ),
    };
  });
};
