import { Schema } from '@vegaprotocol/types';
import type { DealTicketMarketFragment } from '../deal-ticket/__generated__/DealTicket';
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
        return 'price';
      }

      if (isMonitoringAuction && isLiquidityTrigger) {
        return 'liquidity';
      }

      return 'auction';
    }

    return true;
  };
};
