import BigNumber from 'bignumber.js';

import { useOrderbook } from '@vegaprotocol/market-depth';
import { type OrderType, Side } from '@vegaprotocol/types';
import { toBigNum } from '@vegaprotocol/utils';

export interface Slippage {
  slippage: string;
  slippagePct: string;
  weightedAveragePrice: string;
  totalVolume: string;
}

export const useSlippage = (
  order: { type: OrderType; side: Side; size: string; price?: string },
  market: {
    id: string;
    decimalPlaces: number;
    positionDecimalPlaces: number;
  }
): Slippage => {
  const { data: book } = useOrderbook(market.id);

  if (!market || !book?.depth.sell?.length || !book?.depth.buy?.length) {
    return {
      slippage: '0',
      slippagePct: '0',
      weightedAveragePrice: '0',
      totalVolume: '0',
    };
  }

  const lowestAsk = toBigNum(book.depth.sell[0].price, market.decimalPlaces);
  const highestBid = toBigNum(book.depth.buy[0].price, market.decimalPlaces);
  const mid = lowestAsk.plus(highestBid).dividedBy(2);

  if (order.side === Side.SIDE_BUY) {
    return calcSlippage({
      side: order.side,
      price: mid,
      limitPrice: order.price
        ? toBigNum(order.price, market.decimalPlaces)
        : undefined,
      size: toBigNum(order.size, market.positionDecimalPlaces),
      priceLevels: book.depth.sell,
      marketDecimals: market.decimalPlaces,
      positionDecimals: market.positionDecimalPlaces,
    });
  }

  if (order.side === Side.SIDE_SELL) {
    return calcSlippage({
      side: order.side,
      price: mid,
      limitPrice: order.price
        ? toBigNum(order.price, market.decimalPlaces)
        : undefined,
      size: toBigNum(order.size, market.positionDecimalPlaces),
      priceLevels: book.depth.buy,
      marketDecimals: market.decimalPlaces,
      positionDecimals: market.positionDecimalPlaces,
    });
  }

  throw new Error('invalid order side');
};

export const calcSlippage = ({
  side,
  price,
  size,
  priceLevels,
  limitPrice,
  marketDecimals,
  positionDecimals,
}: {
  side: Side;
  price: BigNumber;
  size: BigNumber;
  priceLevels: Array<{ volume: string; price: string }>;
  limitPrice?: BigNumber;
  marketDecimals: number;
  positionDecimals: number;
}) => {
  if (size.isLessThanOrEqualTo(0)) {
    return {
      slippage: '0',
      slippagePct: '0',
      weightedAveragePrice: '0',
      totalVolume: '0',
    };
  }

  let remainingSize = size;
  let totalVolume = new BigNumber(0);
  let weightedSum = new BigNumber(0);

  for (const lvl of priceLevels) {
    if (remainingSize.isLessThanOrEqualTo(0)) {
      break;
    }

    const volume = BigNumber.min(
      remainingSize,
      toBigNum(lvl.volume, positionDecimals)
    );
    const price = toBigNum(lvl.price, marketDecimals);

    if (side === Side.SIDE_BUY) {
      if (limitPrice !== undefined && price.isGreaterThan(limitPrice)) {
        break;
      }
    } else if (side === Side.SIDE_SELL) {
      if (limitPrice !== undefined && price.isLessThan(limitPrice)) {
        break;
      }
    }

    remainingSize = remainingSize.minus(volume);
    totalVolume = totalVolume.plus(volume);
    weightedSum = weightedSum.plus(volume.times(price));
  }

  if (totalVolume.isZero()) {
    return {
      slippage: '0',
      slippagePct: '0',
      weightedAveragePrice: '0',
      totalVolume: '0',
    };
  }

  const weightedAveragePrice = weightedSum.dividedBy(totalVolume);
  const slippage = weightedAveragePrice.minus(price);

  return {
    slippage: slippage.abs().toString(),
    slippagePct: slippage.dividedBy(price).times(100).abs().toString(),
    weightedAveragePrice: weightedAveragePrice.toString(),
    totalVolume: totalVolume.toString(),
  };
};
