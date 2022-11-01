import type { ReactNode } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { useMemo } from 'react';
import { t, toDecimal } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import {
  AuctionTrigger,
  MarketState,
  MarketStateMapping,
  MarketTradingMode,
  Schema,
} from '@vegaprotocol/types';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { ERROR_SIZE_DECIMAL } from './validate-size';
import { MarketDataGrid } from '../trading-mode-tooltip';
import { compileGridData } from '../trading-mode-tooltip/compile-grid-data';
import type { DealTicketMarketFragment } from '../deal-ticket/__generated___/DealTicket';
import { ValidateMargin } from './validate-margin';
import type { OrderMargin } from '../../hooks/use-order-margin';
import { useOrderMarginValidation } from './use-order-margin-validation';
import * as constants from '../constants';

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
  orderType: Schema.OrderType;
  orderTimeInForce: Schema.OrderTimeInForce;
  fieldErrors?: FieldErrors<OrderSubmissionBody['orderSubmission']>;
  estMargin: OrderMargin | null;
};

export const marketTranslations = (marketState: MarketState) => {
  switch (marketState) {
    case MarketState.STATE_TRADING_TERMINATED:
      return t('terminated');
    default:
      return t(MarketStateMapping[marketState]).toLowerCase();
  }
};

export type DealTicketSection =
  | ''
  | typeof constants.DEAL_TICKET_SECTION_TYPE
  | typeof constants.DEAL_TICKET_SECTION_SIZE
  | typeof constants.DEAL_TICKET_SECTION_PRICE
  | typeof constants.DEAL_TICKET_SECTION_FORCE
  | typeof constants.DEAL_TICKET_SECTION_EXPIRY
  | typeof constants.DEAL_TICKET_SECTION_SUMMARY;

export const useOrderValidation = ({
  market,
  fieldErrors = {},
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

  const { message, isDisabled, section } = useMemo<{
    message: ReactNode | string;
    isDisabled: boolean;
    section: DealTicketSection;
  }>(() => {
    if (!pubKey) {
      return {
        message: t('No public key selected'),
        isDisabled: true,
        section: constants.DEAL_TICKET_SECTION_SUMMARY,
      };
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
        section: constants.DEAL_TICKET_SECTION_SUMMARY,
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
        section: constants.DEAL_TICKET_SECTION_SUMMARY,
      };
    }

    if (isMarketInAuction(market)) {
      if (orderType === Schema.OrderType.TYPE_MARKET) {
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
            section: constants.DEAL_TICKET_SECTION_TYPE,
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
            section: constants.DEAL_TICKET_SECTION_TYPE,
          };
        }
        return {
          isDisabled: true,
          message: t(
            'Only limit orders are permitted when market is in auction'
          ),
          section: constants.DEAL_TICKET_SECTION_SUMMARY,
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
            section: constants.DEAL_TICKET_SECTION_FORCE,
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
            section: constants.DEAL_TICKET_SECTION_FORCE,
          };
        }
        return {
          isDisabled: true,
          message: t(
            `Until the auction ends, you can only place GFA, GTT, or GTC limit orders`
          ),
          section: constants.DEAL_TICKET_SECTION_FORCE,
        };
      }
    }

    if (fieldErrors?.size?.type === 'required') {
      return {
        isDisabled: true,
        message: t('You need to provide a size'),
        section: constants.DEAL_TICKET_SECTION_SIZE,
      };
    }

    if (fieldErrors?.size?.type === 'min') {
      return {
        isDisabled: true,
        message: t(`Size cannot be lower than "${minSize}"`),
        section: constants.DEAL_TICKET_SECTION_SIZE,
      };
    }

    if (
      fieldErrors?.price?.type === 'required' &&
      orderType !== Schema.OrderType.TYPE_MARKET
    ) {
      return {
        isDisabled: true,
        message: t('You need to provide a price'),
        section: constants.DEAL_TICKET_SECTION_PRICE,
      };
    }

    if (
      fieldErrors?.price?.type === 'min' &&
      orderType !== Schema.OrderType.TYPE_MARKET
    ) {
      return {
        isDisabled: true,
        message: t(`The price cannot be negative`),
        section: constants.DEAL_TICKET_SECTION_PRICE,
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
          section: constants.DEAL_TICKET_SECTION_SIZE,
        };
      }
      return {
        isDisabled: true,
        message: t(
          `The size field accepts up to ${market.positionDecimalPlaces} decimal places`
        ),
        section: constants.DEAL_TICKET_SECTION_SIZE,
      };
    }

    if (isInvalidOrderMargin) {
      return {
        isDisabled: true,
        message: <ValidateMargin {...isInvalidOrderMargin} />,
        section: constants.DEAL_TICKET_SECTION_PRICE,
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
        section: constants.DEAL_TICKET_SECTION_SUMMARY,
      };
    }

    return {
      isDisabled: false,
      message: '',
      section: '',
    };
  }, [
    minSize,
    pubKey,
    market,
    fieldErrors?.size?.type,
    fieldErrors?.size?.message,
    fieldErrors?.price?.type,
    orderType,
    orderTimeInForce,
    isInvalidOrderMargin,
  ]);

  return { message, isDisabled, section };
};
