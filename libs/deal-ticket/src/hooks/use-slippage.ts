import { useOrderbook } from '@vegaprotocol/market-depth';
import { type OrderType, Side } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';

export interface Slippage {
  slippage: string;
  slippagePct: string;
  weightedAveragePrice: string;
}

export const useSlippage = (
  order: { type: OrderType; side: Side; size: string; price?: string },
  marketId: string
): Slippage => {
  const { data } = useOrderbook(marketId);

  if (order.side === Side.SIDE_BUY) {
    if (!data?.depth.sell?.length) {
      return { slippage: '', slippagePct: '', weightedAveragePrice: '' };
    }

    const lowestAsk = data.depth.sell[0].price;

    return calcSlippage({
      price: lowestAsk,
      limitPrice: order.price,
      size: order.size,
      priceLevels: data.depth.sell,
    });
  }

  if (order.side === Side.SIDE_SELL) {
    if (!data?.depth.buy?.length) {
      return { slippage: '', slippagePct: '', weightedAveragePrice: '' };
    }

    const highestBid = data.depth.buy[0].price;

    return calcSlippage({
      price: highestBid,
      limitPrice: order.price,
      size: order.size,
      priceLevels: data.depth.buy,
    });
  }

  return { slippage: '', slippagePct: '', weightedAveragePrice: '' };
};

export const calcSlippage = ({
  price,
  size,
  priceLevels,
  limitPrice,
}: {
  price: string;
  size: string;
  priceLevels: Array<{ volume: string; price: string }>;
  limitPrice?: string;
}) => {
  if (size === '0') {
    return { slippage: '0', slippagePct: '0', weightedAveragePrice: price };
  }

  let remainingSize = new BigNumber(size);
  let totalVolume = new BigNumber(0);
  let weightedSum = new BigNumber(0);

  for (const lvl of priceLevels) {
    if (remainingSize.isLessThanOrEqualTo(0)) {
      break;
    }

    const volume = BigNumber.min(remainingSize, lvl.volume);
    const price = new BigNumber(lvl.price);

    if (limitPrice !== undefined && price.isGreaterThan(limitPrice)) {
      break;
    }

    remainingSize = remainingSize.minus(volume);
    totalVolume = totalVolume.plus(volume);
    weightedSum = weightedSum.plus(volume.times(price));
  }

  if (totalVolume.isZero()) {
    return { slippage: '0', slippagePct: '0', weightedAveragePrice: price };
  }

  const weightedAveragePrice = weightedSum.dividedBy(totalVolume);
  const slippage = weightedAveragePrice.minus(price);
  return {
    slippage: slippage.toString(),
    slippagePct: slippage.dividedBy(price).times(100).toString(),
    weightedAveragePrice: weightedAveragePrice.toString(),
  };
};
