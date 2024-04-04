import { Side, type PriceLevel, type OrderType } from '@vegaprotocol/types';

export const useSlippage = (
  book: {
    sell: PriceLevel[];
    buy: PriceLevel[];
  },
  order: { type: OrderType; side: Side; size: string }
) => {
  if (order.side === Side.SIDE_BUY) {
    const lowestAsk = book.sell[0].price;
    const slippage = calcSlippage(lowestAsk, order.size, book.sell);
    return { slippage: slippage.toString() };
  }

  if (order.side === Side.SIDE_SELL) {
    const highestBid = book.buy[0].price;
    const slippage = calcSlippage(highestBid, order.size, book.buy);
    return { slippage: slippage.toString() };
  }

  return { slippage: '0' };
};

const calcSlippage = (
  price: string,
  size: string,
  asks: Array<{ volume: string; price: string }>
) => {
  let totalVolume = BigInt(0);
  let weightedSum = BigInt(0);

  for (const lvl of asks) {
    if (totalVolume >= BigInt(size)) {
      break;
    }

    const volume = BigInt(lvl.volume);
    const price = BigInt(lvl.price);
    totalVolume = totalVolume + volume;
    weightedSum = weightedSum + volume * price;
  }

  const weightedAveragePrice = weightedSum / totalVolume;
  const slippage = weightedAveragePrice - BigInt(price);

  // console.log(price, weightedSum, weightedAveragePrice, slippage);

  return slippage;
};
