import * as Schema from '@vegaprotocol/types';
import { MarketModeValidationType } from '../constants';
import { isMarketInAuction } from '@vegaprotocol/markets';

export const validateTimeInForce = (
  marketTradingMode: Schema.MarketTradingMode,
  trigger: Schema.AuctionTrigger
) => {
  return (value: Schema.OrderTimeInForce) => {
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

    if (isMarketInAuction(marketTradingMode)) {
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
