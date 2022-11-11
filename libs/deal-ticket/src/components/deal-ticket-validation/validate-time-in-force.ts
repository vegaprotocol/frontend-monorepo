import { Schema } from '@vegaprotocol/types';
import type { DealTicketMarketFragment } from '../deal-ticket/__generated__/DealTicket';
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
          return 'liquidity';
        }

        if (isMonitoringAuction && isPriceTrigger) {
          return 'price';
        }

        return 'auction';
      }
    }

    return true;
  };
};
