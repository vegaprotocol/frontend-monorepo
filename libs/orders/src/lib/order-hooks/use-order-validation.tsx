import type { FieldErrors } from 'react-hook-form';
import { useMemo } from 'react';
import { t, toDecimal } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import {
  MarketState,
  MarketTradingMode,
  OrderTimeInForce,
  OrderType,
} from '@vegaprotocol/types';
import { ERROR_SIZE_DECIMAL } from '../utils/validate-size';
import type { Order } from './use-order-submit';

export type ValidationArgs = {
  market: {
    state: MarketState;
    tradingMode: MarketTradingMode;
    positionDecimalPlaces: number;
  };
  orderType: OrderType;
  orderTimeInForce: OrderTimeInForce;
  fieldErrors?: FieldErrors<Order>;
};

export const marketTranslations = (marketState: MarketState) => {
  switch (marketState) {
    case MarketState.STATE_TRADING_TERMINATED:
      return t('terminated');
    default:
      return t(marketState).toLowerCase();
  }
};

export const useOrderValidation = ({
  market,
  fieldErrors = {},
  orderType,
  orderTimeInForce,
}: ValidationArgs) => {
  const { keypair } = useVegaWallet();
  const minSize = toDecimal(market.positionDecimalPlaces);

  const { message, isDisabled } = useMemo(() => {
    if (!keypair) {
      return { message: t('No public key selected'), isDisabled: true };
    }

    if (keypair.tainted) {
      return {
        isDisabled: true,
        message: t('Selected public key has been tainted'),
      };
    }

    if (
      [
        MarketState.STATE_SETTLED,
        MarketState.STATE_REJECTED,
        MarketState.STATE_TRADING_TERMINATED,
      ].includes(market.state)
    ) {
      return {
        isDisabled: true,
        message: t(
          `This market is ${marketTranslations(
            market.state
          )} and not accepting orders`
        ),
      };
    }

    if (
      [
        MarketState.STATE_SUSPENDED,
        MarketState.STATE_PENDING,
        MarketState.STATE_PROPOSED,
        MarketState.STATE_CANCELLED,
        MarketState.STATE_CLOSED,
      ].includes(market.state)
    ) {
      return {
        isDisabled: false,
        message: t(
          `This market is ${marketTranslations(
            market.state
          )} and only accepting liquidity commitment orders`
        ),
      };
    }

    if (market.state !== MarketState.STATE_ACTIVE) {
      if (market.state === MarketState.STATE_SUSPENDED) {
        if (market.tradingMode === MarketTradingMode.TRADING_MODE_CONTINUOUS) {
          if (orderType !== OrderType.TYPE_LIMIT) {
            return {
              isDisabled: true,
              message: t(
                'Only limit orders are permitted when market is in auction'
              ),
            };
          }

          if (
            [
              OrderTimeInForce.TIME_IN_FORCE_FOK,
              OrderTimeInForce.TIME_IN_FORCE_IOC,
              OrderTimeInForce.TIME_IN_FORCE_GFN,
            ].includes(orderTimeInForce)
          ) {
            return {
              isDisabled: true,
              message: t(
                'Only GTT, GTC and GFA are permitted when market is in auction'
              ),
            };
          }
        }

        return {
          isDisabled: false,
          message: t(
            `This market is ${marketTranslations(
              market.state
            )} and only accepting liquidity commitment orders`
          ),
        };
      }

      if (
        market.state === MarketState.STATE_PROPOSED ||
        market.state === MarketState.STATE_PENDING
      ) {
        return {
          isDisabled: false,
          message: t(
            `This market is ${marketTranslations(
              market.state
            )} and only accepting liquidity commitment orders`
          ),
        };
      }

      return {
        isDisabled: true,
        message: t('This market is no longer active.'),
      };
    }

    if (market.tradingMode !== MarketTradingMode.TRADING_MODE_CONTINUOUS) {
      if (orderType !== OrderType.TYPE_LIMIT) {
        return {
          isDisabled: true,
          message: t(
            'Only limit orders are permitted when market is in auction'
          ),
        };
      }

      if (
        [
          OrderTimeInForce.TIME_IN_FORCE_FOK,
          OrderTimeInForce.TIME_IN_FORCE_IOC,
          OrderTimeInForce.TIME_IN_FORCE_GFN,
        ].includes(orderTimeInForce)
      ) {
        return {
          isDisabled: true,
          message: t(
            'Only GTT, GTC and GFA are permitted when market is in auction'
          ),
        };
      }
    }

    if (fieldErrors?.size?.type === 'required') {
      return {
        isDisabled: true,
        message: t('You need to provide an amount'),
      };
    }

    if (fieldErrors?.size?.type === 'min') {
      return {
        isDisabled: true,
        message: t(`The amount cannot be lower than "${minSize}"`),
      };
    }

    if (fieldErrors?.price?.type === 'required') {
      return {
        isDisabled: true,
        message: t('You need to provide a price'),
      };
    }

    if (fieldErrors?.price?.type === 'min') {
      return {
        isDisabled: true,
        message: t(`The price cannot be negative`),
      };
    }

    if (
      fieldErrors?.size?.type === 'validate' &&
      fieldErrors?.size?.message === ERROR_SIZE_DECIMAL
    ) {
      if (market.positionDecimalPlaces === 0) {
        return {
          isDisabled: true,
          message: t('Order sizes must be in whole numbers for this market'),
        };
      }
      return {
        isDisabled: true,
        message: t(
          `The amount field accepts up to ${market.positionDecimalPlaces} decimal places`
        ),
      };
    }

    return { isDisabled: false, message: '' };
  }, [
    minSize,
    keypair,
    market,
    fieldErrors?.size?.type,
    fieldErrors?.size?.message,
    fieldErrors?.price?.type,
    orderType,
    orderTimeInForce,
  ]);

  return { message, isDisabled };
};
