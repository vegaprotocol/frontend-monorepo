import { Schema } from '@vegaprotocol/types';
import { MarketModeValidationType } from '../constants';
import { isMarketInAuction } from './is-market-in-auction';
import type { MarketDealTicket } from '@vegaprotocol/market-list';

export const validateTimeInForce = (market: MarketDealTicket) => {
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
          return MarketModeValidationType.LiquidityMonitoringAuction;
        }

        if (isMonitoringAuction && isPriceTrigger) {
          return MarketModeValidationType.PriceMonitoringAuction;
        }

        return MarketModeValidationType.Auction;
      }
    }

    return true;
  };
};
