import { Side } from '@vegaprotocol/types';
import { determineSizeStep, toBigNum } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';

const calcMaxBuy = (
  quoteBalance: string,
  quoteDecimals: number,
  price: BigNumber
) => {
  return toBigNum(quoteBalance, quoteDecimals).div(price);
};

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

export const calcMaxSize = (args: {
  side: Side;
  price: BigNumber;
  feeFactors: {
    infrastructureFee: string;
    liquidityFee: string;
    makerFee: string;
  };
  accounts: {
    base: {
      balance: string;
      decimals: number;
    };
    quote: {
      balance: string;
      decimals: number;
    };
  };
  market: {
    decimalPlaces: number;
    positionDecimalPlaces: number;
  };
}) => {
  let max = new BigNumber(0);

  if (args.side === Side.SIDE_BUY) {
    max = calcMaxBuy(
      args.accounts.quote.balance,
      args.accounts.quote.decimals,
      args.price
    );
  } else if (args.side === Side.SIDE_SELL) {
    max = calcMaxSell(args.accounts.base.balance, args.accounts.base.decimals);
  }

  max = calcFees(max, args.feeFactors);

  // round to size step
  max = max.minus(
    max.mod(
      determineSizeStep({
        positionDecimalPlaces: args.market.positionDecimalPlaces,
      })
    )
  );

  return max;
};
