import * as Schema from '@vegaprotocol/types';
import { MarketModeValidationType } from '../constants';
import { isMarketInAuction } from './is-market-in-auction';
import type { MarketDealTicket } from '@vegaprotocol/market-list';

export const validateType = (market: MarketDealTicket) => {
  return (value: Schema.OrderType) => {
    if (isMarketInAuction(market) && value === Schema.OrderType.TYPE_MARKET) {
      const isMonitoringAuction =
        market.data.marketTradingMode ===
        Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION;
      const isPriceTrigger =
        market.data.trigger === Schema.AuctionTrigger.AUCTION_TRIGGER_PRICE;
      const isLiquidityTrigger =
        market.data.trigger === Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY;

      if (isMonitoringAuction && isPriceTrigger) {
        return MarketModeValidationType.PriceMonitoringAuction;
      }

      if (isMonitoringAuction && isLiquidityTrigger) {
        return MarketModeValidationType.LiquidityMonitoringAuction;
      }

      return MarketModeValidationType.Auction;
    }

    return true;
  };
};
