import { Side, type PriceLevel, type OrderType } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';

export const useSlippage = (
  book: {
    sell: PriceLevel[];
    buy: PriceLevel[];
  },
  order: { type: OrderType; side: Side; size: string; price: string }
) => {
  if (order.side === Side.SIDE_BUY) {
    const lowestAsk = book.sell[0].price;
    return calcSlippage({
      price: lowestAsk,
      limitPrice: order.price,
      size: order.size,
      priceLevels: book.sell,
    });
  }

  if (order.side === Side.SIDE_SELL) {
    const highestBid = book.buy[0].price;
    return calcSlippage({
      price: highestBid,
      limitPrice: order.price,
      size: order.size,
      priceLevels: book.buy,
    });
  }

  return { slippage: '0', weightedAveragePrice: '0' };
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

  const weightedAveragePrice = weightedSum.dividedBy(totalVolume);
  const slippage = weightedAveragePrice.minus(price);

  return {
    slippage: slippage.toString(),
    weightedAveragePrice: weightedAveragePrice.toString(),
  };
};
