import type { ReactNode } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { useMemo } from 'react';
import { t, toDecimal } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { MarketStateMapping, Schema } from '@vegaprotocol/types';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import type {
  DealTicketMarketFragment,
  OrderMargin,
} from '@vegaprotocol/deal-ticket';
import {
  MarketDataGrid,
  compileGridData,
  MarginWarning,
  isMarketInAuction,
  ERROR_SIZE_DECIMAL,
  useOrderMarginValidation,
} from '@vegaprotocol/deal-ticket';

export const DEAL_TICKET_SECTION = {
  TYPE: 'sec-type',
  SIZE: 'sec-size',
  PRICE: 'sec-price',
  FORCE: 'sec-force',
  EXPIRY: 'sec-expiry',
  SUMMARY: 'sec-summary',
};

export const ERROR_EXPIRATION_IN_THE_PAST = 'ERROR_EXPIRATION_IN_THE_PAST';

export type ValidationProps = {
  step?: number;
  market: DealTicketMarketFragment;
  orderType: Schema.OrderType;
  orderTimeInForce: Schema.OrderTimeInForce;
  fieldErrors?: FieldErrors<OrderSubmissionBody['orderSubmission']>;
  estMargin: OrderMargin | null;
};

export const marketTranslations = (marketState: Schema.MarketState) => {
  switch (marketState) {
    case Schema.MarketState.STATE_TRADING_TERMINATED:
      return t('terminated');
    default:
      return t(MarketStateMapping[marketState]).toLowerCase();
  }
};

export type DealTicketSection =
  | ''
  | typeof DEAL_TICKET_SECTION[keyof typeof DEAL_TICKET_SECTION];

export const useOrderValidation = ({
  market,
  fieldErrors,
  orderType,
  orderTimeInForce,
  estMargin,
}: ValidationProps): {
  message: ReactNode | string;
  isDisabled: boolean;
  section: DealTicketSection;
} => {
  const { pubKey } = useVegaWallet();
  const minSize = toDecimal(market.positionDecimalPlaces);
  const isInvalidOrderMargin = useOrderMarginValidation({ market, estMargin });

  const fieldErrorChecking = useMemo<{
    message: ReactNode | string;
    isDisabled: boolean;
    section: DealTicketSection;
  } | null>(() => {
    if (fieldErrors?.size?.type || fieldErrors?.price?.type) {
      if (fieldErrors?.size?.type === 'required') {
        return {
          isDisabled: true,
          message: t('You need to provide a size'),
          section: DEAL_TICKET_SECTION.SIZE,
        };
      }

      if (fieldErrors?.size?.type === 'min') {
        return {
          isDisabled: true,
          message: t(`Size cannot be lower than "${minSize}"`),
          section: DEAL_TICKET_SECTION.SIZE,
        };
      }

      if (
        fieldErrors?.price?.type === 'required' &&
        orderType !== Schema.OrderType.TYPE_MARKET
      ) {
        return {
          isDisabled: true,
          message: t('You need to provide a price'),
          section: DEAL_TICKET_SECTION.PRICE,
        };
      }

      if (
        fieldErrors?.price?.type === 'min' &&
        orderType !== Schema.OrderType.TYPE_MARKET
      ) {
        return {
          isDisabled: true,
          message: t(`The price cannot be negative`),
          section: DEAL_TICKET_SECTION.PRICE,
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
            section: DEAL_TICKET_SECTION.SIZE,
          };
        }
        return {
          isDisabled: true,
          message: t(
            `The size field accepts up to ${market.positionDecimalPlaces} decimal places`
          ),
          section: DEAL_TICKET_SECTION.SIZE,
        };
      }
    }

    if (
      fieldErrors?.expiresAt?.type === 'validate' &&
      fieldErrors?.expiresAt.message === ERROR_EXPIRATION_IN_THE_PAST
    ) {
      return {
        isDisabled: false,
        message: t(
          'The expiry date that you have entered appears to be in the past'
        ),
        section: DEAL_TICKET_SECTION.EXPIRY,
      };
    }
    return null;
  }, [
    fieldErrors?.size?.type,
    fieldErrors?.size?.message,
    fieldErrors?.price?.type,
    fieldErrors?.expiresAt?.type,
    fieldErrors?.expiresAt?.message,
    orderType,
    minSize,
    market.positionDecimalPlaces,
  ]);

  const { message, isDisabled, section } = useMemo<{
    message: ReactNode | string;
    isDisabled: boolean;
    section: DealTicketSection;
  }>(() => {
    if (!pubKey) {
      return {
        message: t('No public key selected'),
        isDisabled: true,
        section: DEAL_TICKET_SECTION.SUMMARY,
      };
    }

    if (
      [
        Schema.MarketState.STATE_SETTLED,
        Schema.MarketState.STATE_REJECTED,
        Schema.MarketState.STATE_TRADING_TERMINATED,
        Schema.MarketState.STATE_CANCELLED,
        Schema.MarketState.STATE_CLOSED,
      ].includes(market.state)
    ) {
      return {
        isDisabled: true,
        message: t(
          `This market is ${marketTranslations(
            market.state
          )} and not accepting orders`
        ),
        section: DEAL_TICKET_SECTION.SUMMARY,
      };
    }

    if (
      [
        Schema.MarketState.STATE_PROPOSED,
        Schema.MarketState.STATE_PENDING,
      ].includes(market.state)
    ) {
      if (fieldErrorChecking) {
        return fieldErrorChecking;
      }
      return {
        isDisabled: false,
        message: t(
          `This market is ${marketTranslations(
            market.state
          )} and only accepting liquidity commitment orders`
        ),
        section: DEAL_TICKET_SECTION.SUMMARY,
      };
    }

    if (isMarketInAuction(market)) {
      if (orderType === Schema.OrderType.TYPE_MARKET) {
        if (
          market.tradingMode ===
            Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
          market.data?.trigger ===
            Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY
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
            section: DEAL_TICKET_SECTION.TYPE,
          };
        }
        if (
          market.tradingMode ===
            Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
          market.data?.trigger === Schema.AuctionTrigger.AUCTION_TRIGGER_PRICE
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
            section: DEAL_TICKET_SECTION.TYPE,
          };
        }
        return {
          isDisabled: true,
          message: t(
            'Only limit orders are permitted when market is in auction'
          ),
          section: DEAL_TICKET_SECTION.SUMMARY,
        };
      }
      if (
        orderType === Schema.OrderType.TYPE_LIMIT &&
        [
          Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
          Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
          Schema.OrderTimeInForce.TIME_IN_FORCE_GFN,
        ].includes(orderTimeInForce)
      ) {
        if (
          market.tradingMode ===
            Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
          market.data?.trigger ===
            Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY
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
            section: DEAL_TICKET_SECTION.FORCE,
          };
        }
        if (
          market.tradingMode ===
            Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
          market.data?.trigger === Schema.AuctionTrigger.AUCTION_TRIGGER_PRICE
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
            section: DEAL_TICKET_SECTION.FORCE,
          };
        }
        return {
          isDisabled: true,
          message: t(
            `Until the auction ends, you can only place GFA, GTT, or GTC limit orders`
          ),
          section: DEAL_TICKET_SECTION.FORCE,
        };
      }
    }

    if (fieldErrorChecking) {
      return fieldErrorChecking;
    }

    if (
      isInvalidOrderMargin.balance.isGreaterThan(0) &&
      isInvalidOrderMargin.balance.isLessThan(isInvalidOrderMargin.margin)
    ) {
      return {
        isDisabled: false,
        message: (
          <MarginWarning
            margin={isInvalidOrderMargin.margin.toString()}
            balance={isInvalidOrderMargin.balance.toString()}
            asset={isInvalidOrderMargin.asset}
          />
        ),
        section: DEAL_TICKET_SECTION.PRICE,
      };
    }

    if (
      [
        Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
        Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
        Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
      ].includes(market.tradingMode)
    ) {
      return {
        isDisabled: false,
        message: t(
          'Any orders placed now will not trade until the auction ends'
        ),
        section: DEAL_TICKET_SECTION.SUMMARY,
      };
    }

    return {
      isDisabled: false,
      message: '',
      section: '',
    };
  }, [
    pubKey,
    market,
    fieldErrorChecking,
    isInvalidOrderMargin,
    orderType,
    orderTimeInForce,
  ]);

  return { message, isDisabled, section };
};
