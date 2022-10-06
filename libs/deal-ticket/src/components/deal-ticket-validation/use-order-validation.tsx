import type { FieldErrors } from 'react-hook-form';
import { useMemo } from 'react';
import { t, toDecimal } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import {
  AuctionTrigger,
  MarketState,
  MarketStateMapping,
  MarketTradingMode,
  OrderTimeInForce,
  OrderType,
} from '@vegaprotocol/types';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { ERROR_SIZE_DECIMAL } from './validate-size';
import { MarketDataGrid } from '../trading-mode-tooltip';
import { compileGridData } from '../trading-mode-tooltip/compile-grid-data';
import type { DealTicketMarketFragment } from '../deal-ticket/__generated___/DealTicket';

export const isMarketInAuction = (market: DealTicketMarketFragment) => {
  return [
    MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
    MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
    MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
  ].includes(market.tradingMode);
};

export type ValidationProps = {
  step?: number;
  market: DealTicketMarketFragment;
  orderType: OrderType;
  orderTimeInForce: OrderTimeInForce;
  fieldErrors?: FieldErrors<OrderSubmissionBody['orderSubmission']>;
};

export const marketTranslations = (marketState: MarketState) => {
  switch (marketState) {
    case MarketState.STATE_TRADING_TERMINATED:
      return t('terminated');
    default:
      return t(MarketStateMapping[marketState]).toLowerCase();
  }
};

export const useOrderValidation = ({
  market,
  fieldErrors = {},
  orderType,
  orderTimeInForce,
}: ValidationProps): {
  message: React.ReactNode | string;
  isDisabled: boolean;
} => {
  const { pubKey } = useVegaWallet();
  const minSize = toDecimal(market.positionDecimalPlaces);

  const { message, isDisabled } = useMemo(() => {
    if (!pubKey) {
      return { message: t('No public key selected'), isDisabled: true };
    }

    if (
      [
        MarketState.STATE_SETTLED,
        MarketState.STATE_REJECTED,
        MarketState.STATE_TRADING_TERMINATED,
        MarketState.STATE_CANCELLED,
        MarketState.STATE_CLOSED,
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
      [MarketState.STATE_PROPOSED, MarketState.STATE_PENDING].includes(
        market.state
      )
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

    if (isMarketInAuction(market)) {
      if (orderType === OrderType.TYPE_MARKET) {
        if (
          market.tradingMode ===
            MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
          market.data?.trigger === AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY
        ) {
          return {
            isDisabled: true,
            message: (
              <span>
                {t('This market is in auction until it reaches')}{' '}
                <Tooltip
                  description={
                    <MarketDataGrid grid={compileGridData(market)} />
                  }
                >
                  <span>{t('sufficient liquidity')}</span>
                </Tooltip>
                {'. '}
                {t('Only limit orders are permitted when market is in auction')}
              </span>
            ),
          };
        }
        if (
          market.tradingMode ===
            MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
          market.data?.trigger === AuctionTrigger.AUCTION_TRIGGER_PRICE
        ) {
          return {
            isDisabled: true,
            message: (
              <span>
                {t('This market is in auction due to')}{' '}
                <Tooltip
                  description={
                    <MarketDataGrid grid={compileGridData(market)} />
                  }
                >
                  <span>{t('high price volatility')}</span>
                </Tooltip>
                {'. '}
                {t('Only limit orders are permitted when market is in auction')}
              </span>
            ),
          };
        }
        return {
          isDisabled: true,
          message: t(
            'Only limit orders are permitted when market is in auction'
          ),
        };
      }
      if (
        orderType === OrderType.TYPE_LIMIT &&
        [
          OrderTimeInForce.TIME_IN_FORCE_FOK,
          OrderTimeInForce.TIME_IN_FORCE_IOC,
          OrderTimeInForce.TIME_IN_FORCE_GFN,
        ].includes(orderTimeInForce)
      ) {
        if (
          market.tradingMode ===
            MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
          market.data?.trigger === AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY
        ) {
          return {
            isDisabled: true,
            message: (
              <span>
                {t('This market is in auction until it reaches')}{' '}
                <Tooltip
                  description={
                    <MarketDataGrid grid={compileGridData(market)} />
                  }
                >
                  <span>{t('sufficient liquidity')}</span>
                </Tooltip>
                {'. '}
                {t(
                  `Until the auction ends, you can only place GFA, GTT, or GTC limit orders`
                )}
              </span>
            ),
          };
        }
        if (
          market.tradingMode ===
            MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
          market.data?.trigger === AuctionTrigger.AUCTION_TRIGGER_PRICE
        ) {
          return {
            isDisabled: true,
            message: (
              <span>
                {t('This market is in auction due to')}{' '}
                <Tooltip
                  description={
                    <MarketDataGrid grid={compileGridData(market)} />
                  }
                >
                  <span>{t('high price volatility')}</span>
                </Tooltip>
                {'. '}
                {t(
                  `Until the auction ends, you can only place GFA, GTT, or GTC limit orders`
                )}
              </span>
            ),
          };
        }
        return {
          isDisabled: true,
          message: t(
            `Until the auction ends, you can only place GFA, GTT, or GTC limit orders`
          ),
        };
      }
    }

    if (fieldErrors?.size?.type === 'required') {
      return {
        isDisabled: true,
        message: t('You need to provide a size'),
      };
    }

    if (fieldErrors?.size?.type === 'min') {
      return {
        isDisabled: true,
        message: t(`Size cannot be lower than "${minSize}"`),
      };
    }

    if (
      fieldErrors?.price?.type === 'required' &&
      orderType !== OrderType.TYPE_MARKET
    ) {
      return {
        isDisabled: true,
        message: t('You need to provide a price'),
      };
    }

    if (
      fieldErrors?.price?.type === 'min' &&
      orderType !== OrderType.TYPE_MARKET
    ) {
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
          `The size field accepts up to ${market.positionDecimalPlaces} decimal places`
        ),
      };
    }

    if (
      [
        MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
        MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
        MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
      ].includes(market.tradingMode)
    ) {
      return {
        isDisabled: false,
        message: t(
          'Any orders placed now will not trade until the auction ends'
        ),
      };
    }

    return { isDisabled: false, message: '' };
  }, [
    minSize,
    pubKey,
    market,
    fieldErrors?.size?.type,
    fieldErrors?.size?.message,
    fieldErrors?.price?.type,
    orderType,
    orderTimeInForce,
  ]);

  return { message, isDisabled };
};
