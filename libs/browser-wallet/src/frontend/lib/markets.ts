import { MarketTradingMode } from '@vegaprotocol/enums';
import type { vegaMarket } from '@vegaprotocol/rest-clients/dist/trading-data';
import get from 'lodash/get';

export const getMarketPriceAssetId = (market: vegaMarket) => {
  const assetId =
    get(market, 'tradableInstrument.instrument.future.settlementAsset') ??
    get(market, 'tradableInstrument.instrument.perpetual.settlementAsset') ??
    get(market, 'tradableInstrument.instrument.spot.quoteAsset');
  if (!assetId) {
    throw new Error(`Could not find settlement asset from market ${market.id}`);
  }
  return assetId;
};

export const isActiveMarket = (market: vegaMarket) => {
  if (!market.tradingMode) return false;
  return [
    MarketTradingMode.TRADING_MODE_CONTINUOUS,
    MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
  ].includes(market.tradingMode);
};

export const isSpotMarket = (market: vegaMarket) => {
  return !!get(market, 'tradableInstrument.instrument.spot');
};
