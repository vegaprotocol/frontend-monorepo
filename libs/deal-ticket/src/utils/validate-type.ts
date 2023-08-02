import * as Schema from '@vegaprotocol/types';
import { MarketModeValidationType } from '../constants';
import { isMarketInAuction } from '@vegaprotocol/markets';

export const validateType = (
  marketTradingMode: Schema.MarketTradingMode,
  trigger: Schema.AuctionTrigger
) => {
  return (value: Schema.OrderType) => {
    if (
      isMarketInAuction(marketTradingMode) &&
      value === Schema.OrderType.TYPE_MARKET
    ) {
      const isMonitoringAuction =
        marketTradingMode ===
        Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION;
      const isPriceTrigger =
        trigger === Schema.AuctionTrigger.AUCTION_TRIGGER_PRICE;
      const isLiquidityTrigger =
        trigger ===
          Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET ||
        trigger ===
          Schema.AuctionTrigger.AUCTION_TRIGGER_UNABLE_TO_DEPLOY_LP_ORDERS;

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
