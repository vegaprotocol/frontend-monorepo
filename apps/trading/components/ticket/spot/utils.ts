import BigNumber from 'bignumber.js';

import { Side } from '@vegaprotocol/types';
import { toBigNum } from '@vegaprotocol/utils';

import { type SpotContextValue } from '../ticket-context';

/**
 * Calculate the max amount you can buy (of the base asset) on spot market
 * given your balance in quote asset
 */
const calcMaxBuy = (
  quoteBalance: string,
  quoteDecimals: number,
  price: BigNumber
) => {
  return toBigNum(quoteBalance, quoteDecimals).div(price);
};

/**
 * Calculate the max amount you can sell (therefore buying the quote asset)
 * on a spot market given your balance of base asset
 */
const calcMaxSell = (baseBalance: string, baseDecimals: number) => {
  return toBigNum(baseBalance, baseDecimals);
};

const calcFees = (
  val: BigNumber,
  feeFactors: {
    infrastructureFee: string;
    liquidityFee: string;
    makerFee: string;
  }
) => {
  return val.multipliedBy(
    1 -
      Number(feeFactors.infrastructureFee) -
      Number(feeFactors.liquidityFee) -
      Number(feeFactors.makerFee)
  );
};

/**
 * Calculate the max possible size given base
 * and quote account balances. For spot orders
 * only
 */
export const calcMaxSize = (args: {
  side: Side;
  price: BigNumber;
  ticket: SpotContextValue;
}) => {
  let max = new BigNumber(0);

  if (args.side === Side.SIDE_BUY) {
    max = calcMaxBuy(
      args.ticket.accounts.quote,
      args.ticket.quoteAsset.decimals,
      args.price
    );
  } else if (args.side === Side.SIDE_SELL) {
    max = calcMaxSell(
      args.ticket.accounts.base,
      args.ticket.baseAsset.decimals
    );
  }

  max = calcFees(max, args.ticket.market.fees.factors);

  return max;
};

export const calcPctBySize = (args: {
  size: BigNumber;
  side: Side;
  price: BigNumber;
  ticket: SpotContextValue;
}) => {
  const maxSize = calcMaxSize(args);
  const pct = args.size.div(maxSize).times(100);
  return pct.toFixed(1);
};
