import type { FieldErrors } from 'react-hook-form';
import { useMemo } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import type { Order } from '@vegaprotocol/wallet';
import {
  useVegaWallet,
  VegaWalletOrderTimeInForce as OrderTimeInForce,
  VegaWalletOrderType as OrderType,
} from '@vegaprotocol/wallet';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import type { Market } from '../market';
import { ERROR_SIZE_DECIMAL } from '../utils/validate-size';

export type ValidationProps = {
  step: number;
  market: Market;
  orderType: OrderType;
  orderTimeInForce: OrderTimeInForce;
  fieldErrors?: FieldErrors<Order>;
};

export const marketTranslations = (marketState: MarketState) => {
  switch (marketState) {
    case MarketState.TradingTerminated:
      return t('terminated');
    default:
      return t(marketState).toLowerCase();
  }
};

export const useOrderValidation = ({
  step,
  market,
  fieldErrors = {},
  orderType,
  orderTimeInForce,
}: ValidationProps) => {
  const { keypair } = useVegaWallet();

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
        MarketState.Settled,
        MarketState.Rejected,
        MarketState.TradingTerminated,
      ].includes(market.state)
    ) {
      return {
        isDisabled: true,
        message: t(
          `This market is ${marketTranslations(
            market.state
          )} and no longer accepting orders`
        ),
      };
    }

    if (
      [
        MarketState.Suspended,
        MarketState.Pending,
        MarketState.Proposed,
        MarketState.Cancelled,
        MarketState.Closed,
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

    if (market.state !== MarketState.Active) {
      if (market.state === MarketState.Suspended) {
        if (market.tradingMode === MarketTradingMode.Continuous) {
          if (orderType !== OrderType.Limit) {
            return {
              isDisabled: true,
              message: t(
                'Only limit orders are permitted when market is in auction'
              ),
            };
          }

          if (
            [
              OrderTimeInForce.FOK,
              OrderTimeInForce.IOC,
              OrderTimeInForce.GFN,
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
        market.state === MarketState.Proposed ||
        market.state === MarketState.Pending
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

    if (market.tradingMode !== MarketTradingMode.Continuous) {
      if (orderType !== OrderType.Limit) {
        return {
          isDisabled: true,
          message: t(
            'Only limit orders are permitted when market is in auction'
          ),
        };
      }

      if (
        [
          OrderTimeInForce.FOK,
          OrderTimeInForce.IOC,
          OrderTimeInForce.GFN,
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
        message: t(`The amount cannot be lower than "${step}"`),
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
          message: t('No decimal amounts allowed for this order'),
        };
      }
      return {
        isDisabled: true,
        message: t(
          `The amount field only takes up to ${market.positionDecimalPlaces} decimals`
        ),
      };
    }

    return { isDisabled: false, message: '' };
  }, [
    keypair,
    step,
    market,
    fieldErrors?.size?.type,
    fieldErrors?.size?.message,
    fieldErrors?.price?.type,
    orderType,
    orderTimeInForce,
  ]);

  return { message, isDisabled };
};
