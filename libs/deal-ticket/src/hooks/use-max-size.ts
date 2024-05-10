import type { MarketInfo } from '@vegaprotocol/markets';
import type { OrderFieldsFragment } from '@vegaprotocol/orders';
import { MarginMode, OrderType, Side } from '@vegaprotocol/types';
import { determineSizeStep, toBigNum } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

export interface UseMaxSizeProps {
  accountDecimals?: number;
  activeOrders?: Pick<
    OrderFieldsFragment,
    'remaining' | 'side' | 'type' | 'price'
  >[];
  decimalPlaces: number;
  generalAccountBalance: string;
  marginAccountBalance: string;
  orderMarginAccountBalance: string;
  baseAssetAccountBalance: string;
  baseAssetDecimals?: number;
  marginFactor?: string;
  marginMode?: MarginMode;
  markPrice?: string;
  openVolume: string;
  positionDecimalPlaces: number;
  price?: string;
  riskFactors: MarketInfo['riskFactors'];
  feesFactors: MarketInfo['fees']['factors'];
  scalingFactors?: Pick<
    NonNullable<
      MarketInfo['tradableInstrument']['marginCalculator']
    >['scalingFactors'],
    'initialMargin'
  >;
  side: Side;
  type: OrderType;
  marketIsInAuction: boolean;
  isSpotMarket: boolean;
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
  orderMarginAccountBalance,
  accountDecimals,
  price,
  decimalPlaces,
  activeOrders,
  riskFactors,
  scalingFactors,
  markPrice,
  marketIsInAuction,
  isSpotMarket,
  baseAssetAccountBalance,
  baseAssetDecimals,
  feesFactors,
}: UseMaxSizeProps) =>
  useMemo(() => {
    let maxSize = new BigNumber(0);
    if (isSpotMarket) {
      const effectivePrice = type === OrderType.TYPE_LIMIT ? price : markPrice;
      if (side === Side.SIDE_BUY) {
        if (accountDecimals !== undefined && effectivePrice) {
          maxSize = toBigNum(generalAccountBalance, accountDecimals).dividedBy(
            toBigNum(effectivePrice, decimalPlaces)
          );
        }
      } else {
        if (baseAssetDecimals !== undefined && effectivePrice) {
          maxSize = toBigNum(baseAssetAccountBalance, baseAssetDecimals);
        }
      }
      maxSize = maxSize.multipliedBy(
        1 -
          Number(feesFactors.infrastructureFee) -
          Number(feesFactors.liquidityFee) -
          Number(feesFactors.makerFee)
      );
      // round to size step
      maxSize = maxSize.minus(
        maxSize.mod(determineSizeStep({ positionDecimalPlaces }))
      );
      return maxSize.toNumber();
    }
    const volume = toBigNum(openVolume, positionDecimalPlaces);
    const reducingPosition =
      (openVolume.startsWith('-') && side === Side.SIDE_BUY) ||
      (!openVolume.startsWith('-') && side === Side.SIDE_SELL);
    if (marginMode === MarginMode.MARGIN_MODE_ISOLATED_MARGIN) {
      if (!marginFactor || !price) {
        return 0;
      }
      let availableMargin =
        accountDecimals !== undefined
          ? toBigNum(generalAccountBalance, accountDecimals).plus(
              reducingPosition && type === OrderType.TYPE_MARKET
                ? toBigNum(marginAccountBalance, accountDecimals)
                : 0
            )
          : new BigNumber(0);
      if (type === OrderType.TYPE_LIMIT && accountDecimals) {
        // if limit order use available collateral from order margin account
        availableMargin = availableMargin.plus(
          toBigNum(orderMarginAccountBalance, accountDecimals)
        );
        // subtract margin that is used to cover remaining orders on that side
        activeOrders?.forEach((order) => {
          if (order.side === side) {
            availableMargin = availableMargin.minus(
              toBigNum(order.remaining, positionDecimalPlaces)
                .multipliedBy(toBigNum(order.price, decimalPlaces))
                .multipliedBy(marginFactor)
            );
          }
        });
      }
      maxSize = availableMargin
        .div(marginFactor)
        .div(toBigNum(price, decimalPlaces));
    } else {
      const effectivePrice =
        type === OrderType.TYPE_LIMIT && marketIsInAuction ? price : markPrice;
      if (
        !scalingFactors?.initialMargin ||
        !riskFactors ||
        !effectivePrice ||
        accountDecimals === undefined
      ) {
        return 0;
      }
      const availableMargin = toBigNum(
        generalAccountBalance,
        accountDecimals
      ).plus(toBigNum(marginAccountBalance, accountDecimals));
      // maxSize = availableMargin / riskFactor / scalingFactors.initialMargin / marketPrice
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
          // subtract open volume if increasing position
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
    maxSize = maxSize.minus(
      maxSize.mod(determineSizeStep({ positionDecimalPlaces }))
    );
    if (reducingPosition && type === OrderType.TYPE_MARKET) {
      // add open volume if position will be reduced
      maxSize = maxSize.plus(volume.abs());
    }
    return maxSize.toNumber();
  }, [
    openVolume,
    positionDecimalPlaces,
    generalAccountBalance,
    orderMarginAccountBalance,
    side,
    marginMode,
    marginFactor,
    type,
    marginAccountBalance,
    accountDecimals,
    price,
    decimalPlaces,
    activeOrders,
    riskFactors,
    scalingFactors,
    markPrice,
    marketIsInAuction,
    baseAssetAccountBalance,
    baseAssetDecimals,
    isSpotMarket,
    feesFactors.infrastructureFee,
    feesFactors.liquidityFee,
    feesFactors.makerFee,
  ]);
