import { useMemo } from 'react';
import { Side } from '@vegaprotocol/types';
import { useOrderBookData } from '@vegaprotocol/market-depth';
import type { Order } from '@vegaprotocol/orders';
import { BigNumber } from 'bignumber.js';
import { formatNumber, toBigNum } from '@vegaprotocol/react-helpers';

interface Props {
  marketId: string;
  order: Order;
}

const useCalculateSlippage = ({ marketId, order }: Props) => {
  const variables = useMemo(() => ({ marketId }), [marketId]);
  const { data } = useOrderBookData({
    variables,
    throttleMilliseconds: 5000,
  });
  const volPriceArr =
    data?.depth[order.side === Side.SIDE_BUY ? 'sell' : 'buy'] || [];
  if (volPriceArr.length) {
    const decimals = data?.decimalPlaces ?? 0;
    const positionDecimals = data?.positionDecimalPlaces ?? 0;
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

export default useCalculateSlippage;
