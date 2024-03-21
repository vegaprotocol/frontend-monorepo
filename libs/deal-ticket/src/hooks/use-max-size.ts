import type { MarketInfo } from '@vegaprotocol/markets';
import type { OrderFieldsFragment } from '@vegaprotocol/orders';
import { MarginMode, OrderType, Side } from '@vegaprotocol/types';
import { toBigNum } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

interface UseMaxSizeProps {
  accountDecimals?: number;
  activeOrders?: OrderFieldsFragment[];
  decimalPlaces: number;
  generalAccountBalance: string;
  marginAccountBalance: string;
  marginFactor?: string;
  marginMode?: MarginMode;
  marketPrice?: string;
  openVolume: string;
  positionDecimalPlaces: number;
  price?: string;
  riskFactors: MarketInfo['riskFactors'];
  scalingFactors?: NonNullable<
    MarketInfo['tradableInstrument']['marginCalculator']
  >['scalingFactors'];
  side: Side;
  sizeStep: string;
  type: OrderType;
  marketIsInAuction: boolean;
}

export const useMaxSize = ({
  openVolume,
  positionDecimalPlaces,
  generalAccountBalance,
  side,
  marginMode,
  marginFactor,
  type,
  marginAccountBalance,
  accountDecimals,
  price,
  decimalPlaces,
  sizeStep,
  activeOrders,
  riskFactors,
  scalingFactors,
  marketPrice,
  marketIsInAuction,
}: UseMaxSizeProps) =>
  useMemo(() => {
    let maxSize = new BigNumber(0);
    const volume = toBigNum(openVolume, positionDecimalPlaces);
    const reducingPosition =
      (openVolume.startsWith('-') && side === Side.SIDE_BUY) ||
      (!openVolume.startsWith('-') && side === Side.SIDE_SELL);
    if (marginMode === MarginMode.MARGIN_MODE_ISOLATED_MARGIN) {
      if (!marginFactor || !price) {
        return maxSize;
      }
      const availableMargin =
        accountDecimals !== undefined
          ? toBigNum(generalAccountBalance, accountDecimals).plus(
              reducingPosition && type === OrderType.TYPE_MARKET
                ? toBigNum(marginAccountBalance, accountDecimals)
                : 0
            )
          : new BigNumber(0);
      maxSize = availableMargin
        .div(marginFactor)
        .div(toBigNum(price, decimalPlaces));
    } else {
      const effectivePrice =
        type === OrderType.TYPE_LIMIT && marketIsInAuction
          ? price
          : marketPrice;
      if (
        !scalingFactors?.initialMargin ||
        !riskFactors ||
        !effectivePrice ||
        accountDecimals === undefined
      ) {
        return maxSize;
      }
      const availableMargin = toBigNum(
        generalAccountBalance,
        accountDecimals
      ).plus(toBigNum(marginAccountBalance, accountDecimals));
      // maxSize = availableMargin / scalingFactors.initialMargin / marketPrice
      maxSize = availableMargin
        .div(
          BigNumber(
            side === Side.SIDE_BUY ? riskFactors.long : riskFactors.short
          )
        )
        .div(scalingFactors.initialMargin)
        .div(toBigNum(effectivePrice, decimalPlaces));
      maxSize = maxSize
        .minus(
          // subtract remaining orders
          toBigNum(
            activeOrders
              ?.filter((order) => order.side === side)
              ?.reduce((sum, order) => sum + BigInt(order.remaining), BigInt(0))
              .toString() || 0,
            positionDecimalPlaces
          )
        )
        .minus(
          // subtract open volume
          side === Side.SIDE_BUY
            ? volume.isGreaterThan(0)
              ? volume
              : 0
            : volume.isLessThan(0)
            ? volume.abs()
            : 0
        );
    }
    // round to size step
    maxSize = maxSize.minus(maxSize.mod(sizeStep));
    if (reducingPosition && type === OrderType.TYPE_MARKET) {
      // add open volume if position will be reduced
      maxSize = maxSize.plus(volume.abs());
    }
    return maxSize;
  }, [
    openVolume,
    positionDecimalPlaces,
    generalAccountBalance,
    side,
    marginMode,
    marginFactor,
    type,
    marginAccountBalance,
    accountDecimals,
    price,
    decimalPlaces,
    sizeStep,
    activeOrders,
    riskFactors,
    scalingFactors,
    marketPrice,
  ]);
