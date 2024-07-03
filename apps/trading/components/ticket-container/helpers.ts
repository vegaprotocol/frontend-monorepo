import { type OrderFieldsFragment } from '@vegaprotocol/orders';
import { Side } from '@vegaprotocol/types';
import { determineSizeStep, toBigNum } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';

export const calcSizeMarketOrder = ({
  pct,
  openVolume,
  markPrice,
  side,
  assetDecimals,
  marketDecimals,
  positionDecimals,
  balances,
  orders,
  scalingFactors,
  riskFactors,
}: {
  pct: number;
  openVolume: string;
  markPrice: string;
  side: Side;
  assetDecimals: number;
  marketDecimals: number;
  positionDecimals: number;
  balances: {
    margin: string;
    general: string;
  };
  orders: OrderFieldsFragment[];
  scalingFactors: {
    initialMargin: number;
    searchLevel: number;
    collateralRelease: number;
  };
  riskFactors: {
    long: string;
    short: string;
  };
}) => {
  const volume = toBigNum(openVolume, positionDecimals);
  const reducingPosition =
    (openVolume.startsWith('-') && side === Side.SIDE_BUY) ||
    (!openVolume.startsWith('-') && side === Side.SIDE_SELL);

  const availableMargin = toBigNum(balances.general, assetDecimals).plus(
    toBigNum(balances.margin, assetDecimals)
  );

  if (availableMargin.isZero()) {
    return '0';
  }

  const _totalSizeRemaining = (orders || [])
    .filter((o) => o.side === side)
    .reduce((sum, o) => sum.plus(o.remaining), new BigNumber(0));
  const totalSizeRemaining = toBigNum(_totalSizeRemaining, positionDecimals);

  let max = new BigNumber(0);

  max = availableMargin
    .div(side === Side.SIDE_BUY ? riskFactors.long : riskFactors.short)
    .div(scalingFactors.initialMargin)
    .div(toBigNum(markPrice, marketDecimals))
    .minus(totalSizeRemaining)
    .minus(
      // subtract open volume if increasing position
      side === Side.SIDE_BUY
        ? volume.isGreaterThan(0)
          ? volume
          : 0
        : volume.isLessThan(0)
        ? volume.abs()
        : 0
    );

  if (reducingPosition) {
    max = max.plus(volume.abs());
  }

  max = max.minus(
    max.mod(determineSizeStep({ positionDecimalPlaces: positionDecimals }))
  );

  const size = new BigNumber(pct).div(100).times(max);

  return size.toString();
};
