import BigNumber from 'bignumber.js';

import { type OrderFieldsFragment } from '@vegaprotocol/orders';
import { MarginMode, OrderType, Side } from '@vegaprotocol/types';
import { toBigNum } from '@vegaprotocol/utils';

import { type DefaultContextValue } from '../ticket-context';
import { type FormFields } from '../schemas';
import * as utils from '../utils';

const calcSizeForIsolated = (
  pct: number,
  fields: FormFields,
  ticket: DefaultContextValue,
  orders: OrderFieldsFragment[],
  price: BigNumber,
  isReducing: boolean
) => {
  const marginMode = ticket.marginMode;
  const marketDecimals = ticket.market.decimalPlaces;
  const positionDecimals = ticket.market.positionDecimalPlaces;
  const assetDecimals = ticket.settlementAsset.decimals;
  const accounts = ticket.accounts;

  let availableMargin = toBigNum(accounts.general, assetDecimals).plus(
    isReducing && fields.type === OrderType.TYPE_MARKET
      ? toBigNum(accounts.margin, assetDecimals)
      : 0
  );

  if (fields.type === OrderType.TYPE_LIMIT) {
    availableMargin = availableMargin.plus(
      toBigNum(accounts.orderMargin, assetDecimals)
    );

    orders.forEach((order) => {
      if (order.side === fields.side) {
        availableMargin = availableMargin.minus(
          toBigNum(order.remaining, positionDecimals)
            .times(toBigNum(order.price, marketDecimals))
            .times(marginMode.factor)
        );
      }
    });
  }

  const max = availableMargin.div(marginMode.factor).div(price);

  const size = BigNumber(pct).div(100).times(max);

  const sizeRounded = utils.roundToPositionDecimals(
    size,
    ticket.market.positionDecimalPlaces
  );

  return sizeRounded;
};

const calcSizeForCross = (
  pct: number,
  fields: FormFields,
  ticket: DefaultContextValue,
  orders: OrderFieldsFragment[],
  price: BigNumber,
  volume: BigNumber,
  isReducing: boolean
) => {
  const isBuy = fields.side === Side.SIDE_BUY;
  const scalingFactors =
    ticket.market.tradableInstrument.marginCalculator?.scalingFactors;
  const riskFactors = ticket.market.riskFactors;
  const positionDecimals = ticket.market.positionDecimalPlaces;
  const assetDecimals = ticket.settlementAsset.decimals;
  const accounts = ticket.accounts;

  if (!riskFactors) {
    throw new Error('no raskFactors');
  }

  if (!scalingFactors) {
    throw new Error('no raskFactors');
  }

  const availableMargin = toBigNum(accounts.general, assetDecimals).plus(
    toBigNum(accounts.margin, assetDecimals)
  );

  if (availableMargin.isZero()) {
    return BigNumber(0);
  }

  const _totalSizeRemaining = orders
    .filter((o) => o.side === fields.side)
    .reduce((sum, o) => sum.plus(o.remaining), BigNumber(0));
  const totalSizeRemaining = toBigNum(_totalSizeRemaining, positionDecimals);

  let max = availableMargin
    .div(isBuy ? riskFactors.long : riskFactors.short)
    .div(scalingFactors.initialMargin)
    .div(price)
    .minus(totalSizeRemaining);

  let subtractValue = BigNumber(0);

  if (isBuy) {
    if (volume.isGreaterThan(0)) {
      subtractValue = volume;
    }
  } else {
    if (volume.isLessThan(0)) {
      subtractValue = volume.abs();
    }
  }

  max = max.minus(subtractValue);

  if (isReducing) {
    max = max.plus(volume.abs());
  }

  const size = BigNumber(pct).div(100).times(max);

  const sizeRounded = utils.roundToPositionDecimals(
    size,
    ticket.market.positionDecimalPlaces
  );

  return sizeRounded;
};

export const calcSizeByPct = ({
  pct,
  ticket,
  fields,
  openVolume,
  price,
  orders,
}: {
  pct: number;
  ticket: DefaultContextValue;
  fields: FormFields;
  openVolume: string;
  price: BigNumber;
  orders: OrderFieldsFragment[];
}) => {
  const marginMode = ticket.marginMode;
  const positionDecimals = ticket.market.positionDecimalPlaces;

  const volume = toBigNum(openVolume, positionDecimals);

  const isReducing =
    (volume.isNegative() && fields.side === Side.SIDE_BUY) ||
    (volume.isPositive() && fields.side === Side.SIDE_SELL);

  if (marginMode.mode === MarginMode.MARGIN_MODE_ISOLATED_MARGIN) {
    return calcSizeForIsolated(pct, fields, ticket, orders, price, isReducing);
  }

  if (marginMode.mode === MarginMode.MARGIN_MODE_CROSS_MARGIN) {
    return calcSizeForCross(
      pct,
      fields,
      ticket,
      orders,
      price,
      volume,
      isReducing
    );
  }

  throw new Error('unspecified margin mode');
};
