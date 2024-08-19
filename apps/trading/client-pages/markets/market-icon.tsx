import { type MarketMaybeWithData } from '@vegaprotocol/markets';
import { MarketTradingMode, MarketState } from '@vegaprotocol/types';
import { VegaIconNames, VegaIcon, Tooltip } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';

export const getMarketStateIcon = (
  state?: MarketState
): VegaIconNames | null => {
  switch (state) {
    case MarketState.STATE_PENDING:
    case MarketState.STATE_PROPOSED:
      return VegaIconNames.MONITOR;
    case MarketState.STATE_SUSPENDED: // market in auction
      return VegaIconNames.HAMMER;
    case MarketState.STATE_SUSPENDED_VIA_GOVERNANCE:
      return VegaIconNames.PAUSE;

    case MarketState.STATE_SETTLED:
    case MarketState.STATE_CLOSED:
    case MarketState.STATE_TRADING_TERMINATED:
    case MarketState.STATE_CANCELLED:
    case MarketState.STATE_REJECTED:
      return VegaIconNames.CLOSED;
    case MarketState.STATE_ACTIVE:
    default:
      return null;
  }
};

export const getMarketStateTooltip = (
  state?: MarketState,
  tradingMode?: MarketTradingMode
): string => {
  switch (state) {
    case MarketState.STATE_SETTLED:
      return 'Market is settled and all positions are closed';
    case MarketState.STATE_PENDING:
      return 'Governance vote passed, market is pending trading';
    case MarketState.STATE_PROPOSED:
      return 'Voting is in progress on this proposed market';
    case MarketState.STATE_TRADING_TERMINATED:
      return 'Market is terminated and awaiting settlement data';
    case MarketState.STATE_SUSPENDED_VIA_GOVERNANCE:
      return 'Trading is suspended due to governance';
    case MarketState.STATE_CANCELLED:
      return 'Market is cancelled';
    case MarketState.STATE_REJECTED:
      return 'Market is rejected';
    case MarketState.STATE_CLOSED:
      return 'Market is closed';
    case MarketState.STATE_SUSPENDED:
      switch (tradingMode) {
        case MarketTradingMode.TRADING_MODE_MONITORING_AUCTION:
          return 'In protective auction due to large price movement, crossed orders are required to set price and restart trading';
        case MarketTradingMode.TRADING_MODE_OPENING_AUCTION:
          return 'In opening auction, liquidity and crossed orders are required to set an opening price and start trading';
        case MarketTradingMode.TRADING_MODE_BATCH_AUCTION:
          return 'Market is in batch auction';
        default:
          return '';
      }
    case MarketState.STATE_ACTIVE:
    default:
      return '';
  }
};

export const MarketIcon = ({ data }: { data?: MarketMaybeWithData | null }) => {
  const t = useT();
  const tradingMode = data?.data?.marketTradingMode;
  const state = data?.data?.marketState;
  const icon = getMarketStateIcon(state);
  const tooltip = getMarketStateTooltip(state, tradingMode);

  if (!icon) return null;
  return (
    <Tooltip description={t(tooltip)}>
      <span className="rounded-full bg-surface-2  p-1 flex items-center">
        <VegaIcon name={icon} size={12} className="flex" />
      </span>
    </Tooltip>
  );
};
