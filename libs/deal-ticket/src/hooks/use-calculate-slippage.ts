import { useMemo } from 'react';
import { marketDepthProvider } from '@vegaprotocol/market-depth';
import * as Schema from '@vegaprotocol/types';
import type { Market } from '@vegaprotocol/market-list';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { BigNumber } from 'bignumber.js';
import {
  formatNumber,
  toBigNum,
  useThrottledDataProvider,
} from '@vegaprotocol/utils';

interface Props {
  market: Market;
  order: OrderSubmissionBody['orderSubmission'];
}

export const useCalculateSlippage = ({ market, order }: Props) => {
  const variables = useMemo(() => ({ marketId: market.id }), [market.id]);
  const { data } = useThrottledDataProvider(
    {
      dataProvider: marketDepthProvider,
      variables,
    },
    1000
  );
  const volPriceArr =
    data?.depth[order.side === Schema.Side.SIDE_BUY ? 'sell' : 'buy'] || [];
  if (volPriceArr.length && market) {
    const decimals = market.decimalPlaces ?? 0;
    const positionDecimals = market.positionDecimalPlaces ?? 0;
    const bestPrice = toBigNum(volPriceArr[0].price, decimals);
    const { size } = order;
    let descSize = new BigNumber(size);
    let i = 0;
    const volPricePairs: Array<[BigNumber, BigNumber]> = [];
    while (!descSize.isZero() && i < volPriceArr.length) {
      const price = toBigNum(volPriceArr[i].price, decimals);
      const amount = BigNumber.min(
        descSize,
        toBigNum(volPriceArr[i].volume, positionDecimals)
      );
      volPricePairs.push([price, amount]);
      descSize = BigNumber.max(0, descSize.minus(amount));
      i++;
    }
    if (volPricePairs.length) {
      const volWeightAvPricePair = volPricePairs.reduce(
        (agg, item) => {
          agg[0] = agg[0].plus(item[0].multipliedBy(item[1]));
          agg[1] = agg[1].plus(item[1]);
          return agg;
        },
        [new BigNumber(0), new BigNumber(0)]
      );
      const volWeightAvPrice = volWeightAvPricePair[0].dividedBy(
        volWeightAvPricePair[1]
      );
      const slippage = volWeightAvPrice
        .minus(bestPrice)
        .absoluteValue()
        .dividedBy(bestPrice)
        .multipliedBy(100);
      return formatNumber(slippage, 2);
    }
  }
  return null;
};
