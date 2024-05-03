import { type MarketMaybeWithData } from '@vegaprotocol/markets';
import { MarketTradingMode, MarketState } from '@vegaprotocol/types';
import { VegaIconNames, VegaIcon, Tooltip } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';

export const getTradingModeIcon = (
  tradingMode: MarketTradingMode,
  state?: MarketState
): VegaIconNames | null => {
  switch (tradingMode) {
    case MarketTradingMode.TRADING_MODE_MONITORING_AUCTION:
    case MarketTradingMode.TRADING_MODE_OPENING_AUCTION:
    case MarketTradingMode.TRADING_MODE_BATCH_AUCTION:
      return VegaIconNames.HAMMER;
    case MarketTradingMode.TRADING_MODE_SUSPENDED_VIA_GOVERNANCE:
      return VegaIconNames.PAUSE;
    case MarketTradingMode.TRADING_MODE_NO_TRADING:
      switch (state) {
        case MarketState.STATE_PENDING:
        case MarketState.STATE_PROPOSED:
          return VegaIconNames.MONITOR;
        default:
          return VegaIconNames.CLOSED;
      }
    default:
      return null;
  }
};

export const getTradingModeTooltip = (
  tradingMode?: MarketTradingMode,
  state?: MarketState
): string => {
  switch (tradingMode) {
    case MarketTradingMode.TRADING_MODE_MONITORING_AUCTION:
      return 'In protective auction due to large price movement, crossed orders are required to set price and restart trading';
    case MarketTradingMode.TRADING_MODE_OPENING_AUCTION:
      return 'In opening auction, liquidity and crossed orders are required to set an opening price and start trading';
    case MarketTradingMode.TRADING_MODE_SUSPENDED_VIA_GOVERNANCE:
      return 'Trading is suspended due to governance';
    case MarketTradingMode.TRADING_MODE_BATCH_AUCTION:
      return 'Market is in batch auction';
    case MarketTradingMode.TRADING_MODE_NO_TRADING:
      switch (state) {
        case MarketState.STATE_SETTLED:
          return 'Market is settled and all positions are closed';
        case MarketState.STATE_PENDING:
        case MarketState.STATE_PROPOSED:
          return 'Voting is in progress on this proposed market';
        default:
          return 'Market is terminated and awaiting settlement data';
      }
    case MarketTradingMode.TRADING_MODE_CONTINUOUS:
    default:
      return '';
  }
};

export const MarketIcon = ({ data }: { data?: MarketMaybeWithData | null }) => {
  const t = useT();
  const tradingMode = data?.data?.marketTradingMode;
  const state = data?.data?.marketState;
  const icon = tradingMode && getTradingModeIcon(tradingMode, state);
  const tooltip = getTradingModeTooltip(tradingMode, state);

  if (!icon) return null;
  return (
    <Tooltip description={t(tooltip)}>
      <VegaIcon name={icon} size={14} className="ml-1" />
    </Tooltip>
  );
};
