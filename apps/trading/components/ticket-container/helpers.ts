import { type OrderFieldsFragment } from '@vegaprotocol/orders';
import { MarginMode, OrderType, Side } from '@vegaprotocol/types';
import { determineSizeStep, toBigNum } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';

export const calcSizeByPct = ({
  pct,
  openVolume,
  price,
  type,
  side,
  assetDecimals,
  marketDecimals,
  positionDecimals,
  accounts,
  orders,
  scalingFactors,
  riskFactors,
  marginMode,
}: {
  pct: number;
  openVolume: string;
  price: string;
  side: Side;
  type: OrderType;
  assetDecimals: number;
  marketDecimals: number;
  positionDecimals: number;
  accounts: {
    general: string;
    margin: string;
    orderMargin: string;
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
  marginMode: {
    mode: MarginMode;
    factor: string;
  };
}) => {
  const volume = toBigNum(openVolume, positionDecimals);
  const reducingPosition =
    (openVolume.startsWith('-') && side === Side.SIDE_BUY) ||
    (!openVolume.startsWith('-') && side === Side.SIDE_SELL);

  if (marginMode.mode === MarginMode.MARGIN_MODE_ISOLATED_MARGIN) {
    let availableMargin = toBigNum(accounts.general, assetDecimals).plus(
      reducingPosition && type === OrderType.TYPE_MARKET
        ? toBigNum(accounts.margin, assetDecimals)
        : 0
    );
    if (type === OrderType.TYPE_LIMIT) {
      availableMargin = availableMargin.plus(
        toBigNum(accounts.orderMargin, assetDecimals)
      );

      orders.forEach((order) => {
        if (order.side === side) {
          availableMargin = availableMargin.minus(
            toBigNum(order.remaining, positionDecimals)
              .times(toBigNum(order.price, marketDecimals))
              .times(marginMode.factor)
          );
        }
      });
    }

    let max = availableMargin
      .div(marginMode.factor)
      .div(toBigNum(price, marketDecimals));

    max = max.minus(
      max.mod(determineSizeStep({ positionDecimalPlaces: positionDecimals }))
    );

    const size = new BigNumber(pct).div(100).times(max);

    return size;
  }

  const availableMargin = toBigNum(accounts.general, assetDecimals).plus(
    toBigNum(accounts.margin, assetDecimals)
  );

  if (availableMargin.isZero()) {
    return BigNumber(0);
  }

  const _totalSizeRemaining = (orders || [])
    .filter((o) => o.side === side)
    .reduce((sum, o) => sum.plus(o.remaining), new BigNumber(0));
  const totalSizeRemaining = toBigNum(_totalSizeRemaining, positionDecimals);

  let max = new BigNumber(0);

  max = availableMargin
    .div(side === Side.SIDE_BUY ? riskFactors.long : riskFactors.short)
    .div(scalingFactors.initialMargin)
    .div(toBigNum(price, marketDecimals))
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

  return size;
};

export const toNotional = (size: BigNumber, price: BigNumber) => {
  return size.times(price);
};

export const toSize = (notional: BigNumber, price: BigNumber) => {
  return notional.div(price);
};
