import { t } from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import type { DealTicketMarketFragment } from '../deal-ticket/__generated__/DealTicket';
import { compileGridData, MarketDataGrid } from '../trading-mode-tooltip';
import { isMarketInAuction } from './use-order-validation';

export const validateType = (market: DealTicketMarketFragment) => {
  return (value: Schema.OrderType) => {
    if (isMarketInAuction(market) && value === Schema.OrderType.TYPE_MARKET) {
      const isMonitoringAuction =
        market.tradingMode ===
        Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION;
      const isPriceTrigger =
        market.data?.trigger === Schema.AuctionTrigger.AUCTION_TRIGGER_PRICE;
      const isLiquidityTrigger =
        market.data?.trigger ===
        Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY;

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
            {t('Only limit orders are permitted when market is in auction')}
          </span>
        );
      }

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
            {t('Only limit orders are permitted when market is in auction')}
          </span>
        );
      }

      return t('Only limit orders are permitted when market is in auction');
    }

    return true;
  };
};
