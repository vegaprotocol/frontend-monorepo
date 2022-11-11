import { t } from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import type { DealTicketMarketFragment } from '../deal-ticket/__generated__/DealTicket';
import { compileGridData, MarketDataGrid } from '../trading-mode-tooltip';
import { isMarketInAuction } from './use-order-validation';

export const validateTimeInForce = (market: DealTicketMarketFragment) => {
  return (value: Schema.OrderTimeInForce) => {
    const isMonitoringAuction =
      market.tradingMode ===
      Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION;
    const isPriceTrigger =
      market.data?.trigger === Schema.AuctionTrigger.AUCTION_TRIGGER_PRICE;
    const isLiquidityTrigger =
      market.data?.trigger === Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY;

    if (isMarketInAuction(market)) {
      if (
        [
          Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
          Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
          Schema.OrderTimeInForce.TIME_IN_FORCE_GFN,
        ].includes(value)
      ) {
        if (isMonitoringAuction && isLiquidityTrigger) {
          return (
            <span>
              {t('This market is in auction until it reaches')}{' '}
              <Tooltip
                description={<MarketDataGrid grid={compileGridData(market)} />}
              >
                <span>{t('sufficient liquidity')}</span>
              </Tooltip>
              {'. '}
              {t(
                `Until the auction ends, you can only place GFA, GTT, or GTC limit orders`
              )}
            </span>
          );
        }

        if (isMonitoringAuction && isPriceTrigger) {
          return (
            <span>
              {t('This market is in auction due to')}{' '}
              <Tooltip
                description={<MarketDataGrid grid={compileGridData(market)} />}
              >
                <span>{t('high price volatility')}</span>
              </Tooltip>
              {'. '}
              {t(
                `Until the auction ends, you can only place GFA, GTT, or GTC limit orders`
              )}
            </span>
          );
        }

        return t(
          `Until the auction ends, you can only place GFA, GTT, or GTC limit orders`
        );
      }
    }

    return true;
  };
};
