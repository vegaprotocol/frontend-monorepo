import type { FieldErrors } from 'react-hook-form';
import { useMemo } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import {
  useVegaWallet,
  VegaWalletOrderTimeInForce as OrderTimeInForce,
  VegaWalletOrderType as OrderType,
} from '@vegaprotocol/wallet';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import { ERROR_SIZE_DECIMAL } from '../utils/validate-size';
import type { Order } from './use-order-submit';

export type ValidationProps = {
  step: number;
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
        MarketState.Cancelled,
        MarketState.Closed,
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

    if ([MarketState.Proposed, MarketState.Pending].includes(market.state)) {
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
      [
        MarketTradingMode.BatchAuction,
        MarketTradingMode.MonitoringAuction,
        MarketTradingMode.OpeningAuction,
      ].includes(market.tradingMode)
    ) {
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

    if (market.state === MarketState.Suspended) {
      return {
        isDisabled: false,
        message: t(
          'Any orders placed now will not trade until the auction ends'
        ),
      };
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
