import { Intent } from '@vegaprotocol/ui-toolkit';
import { MarketState } from '@vegaprotocol/types';
import { t } from '@vegaprotocol/react-helpers';

export const MARKET_STATUS: Record<MarketState | '', Intent> = {
  [MarketState.Active]: Intent.Success,
  [MarketState.Cancelled]: Intent.Primary,
  [MarketState.Closed]: Intent.None,
  [MarketState.Pending]: Intent.Warning,
  [MarketState.Proposed]: Intent.Warning,
  [MarketState.Rejected]: Intent.Danger,
  [MarketState.Settled]: Intent.Primary,
  [MarketState.Suspended]: Intent.Warning,
  [MarketState.TradingTerminated]: Intent.Danger,
  '': Intent.Primary,
};

export const STATES_FILTER = [
  { value: 'all', text: t('All') },
  { value: 'Active', text: t('Active') },
  { value: 'Cancelled', text: t('Cancelled') },
  { value: 'Closed', text: t('Closed') },
  { value: 'Pending', text: t('Pending') },
  { value: 'Proposed', text: t('Proposed') },
  { value: 'Rejected', text: t('Rejected') },
  { value: 'Settled', text: t('Settled') },
  { value: 'Suspended', text: t('Suspended') },
  { value: 'TradingTerminated', text: t('TradingTerminated') },
];
