import { Side, type PriceLevel, type OrderType } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';

export const useSlippage = (
  book: {
    sell: PriceLevel[];
    buy: PriceLevel[];
  },
  order: { type: OrderType; side: Side; size: string }
) => {
  if (order.side === Side.SIDE_BUY) {
    const lowestAsk = book.sell[0].price;
    return calcSlippage({
      price: lowestAsk,
      size: order.size,
      priceLevels: book.sell,
    });
  }

  if (order.side === Side.SIDE_SELL) {
    const highestBid = book.buy[0].price;
    return calcSlippage({
      price: highestBid,
      size: order.size,
      priceLevels: book.buy,
    });
  }

  return { slippage: '0' };
};

export const calcSlippage = ({
  price,
  size,
  priceLevels,
}: {
  price: string;
  size: string;
  priceLevels: Array<{ volume: string; price: string }>;
}) => {
  let remainingSize = new BigNumber(size);
  let totalVolume = new BigNumber(0);
  let weightedSum = new BigNumber(0);

  for (const lvl of priceLevels) {
    if (remainingSize.isLessThanOrEqualTo(0)) {
      break;
    }

    // const volume = new BigNumber(lvl.volume);
    const volume = BigNumber.min(remainingSize, lvl.volume);
    const price = new BigNumber(lvl.price);

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
