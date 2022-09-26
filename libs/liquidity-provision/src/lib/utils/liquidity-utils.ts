/* tslint:disable */
/* eslint-disable */

import type { Market } from '@vegaprotocol/market-list';
// import type { CandleClose } from '@vegaprotocol/types';
// import isNil from 'lodash/isNil';

import BigNumber from 'bignumber.js';
import { addDecimalsFormatNumber } from '@vegaprotocol/react-helpers';

// @ts-ignore
const calcCandleVolume = (market) => {
  const edges = market?.candlesConnection?.edges || [];
  return (
    edges
      // @ts-ignore
      .reduce((acc, c) => {
        return acc.plus(new BigNumber(c?.node?.volume ?? 0));
      }, new BigNumber(edges?.[0]?.node?.volume ?? 0))
      .toString()
  );
};

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

// const getPriceChange = () => {

// }
// // @ts-ignore
// const getMarketChange = (market) => {
//   const decimalPlaces = market.decimalPlaces;
//   const edges = market?.candlesConnection?.edges || [];
//   // @ts-ignore
//   const candles = edges
//     // @ts-ignore
//     .map((e) => {
//       return e.node;
//     })
//     // @ts-ignore
//     .filter((e) => e);

//   // @ts-ignore
//   const candlesClose = candles
//     // @ts-ignore
//     ?.map((candle) => candle?.close)
//     .filter((c: string | undefined): c is CandleClose => !isNil(c));
// };

// <PriceCellChange candles={candlesClose} decimalPlaces={market.decimalPlaces} />;

// @ts-ignore
export const mapMarketLists = (markets) => {
  return markets.map((market = {}) => {
    const dayVolume = calcCandleVolume(market);

    return {
      ...market,
      dayVolume,
      liquidityCommitted: sumLiquidityCommitted(
        // @ts-ignore
        market?.liquidityProvisionsConnection?.edges
      ),
    };
  });
};
