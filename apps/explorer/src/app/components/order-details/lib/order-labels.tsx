import { t } from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';

export interface DeterministicOrderDetailsProps {
  id: string;
  // Version to fetch, with 0 being 'latest' and 1 being 'first'. Defaults to 0
  version?: number;
}

export const statusText: Record<Schema.OrderStatus, string> = {
  STATUS_ACTIVE: t('Active'),
  STATUS_CANCELLED: t('Cancelled'),
  STATUS_EXPIRED: t('Expired'),
  STATUS_FILLED: t('Filled'),
  STATUS_PARKED: t('Parked'),
  // Intentionally vague - table shows partial fills
  STATUS_PARTIALLY_FILLED: t('Active'),
  STATUS_REJECTED: t('Rejected'),
  STATUS_STOPPED: t('Stopped'),
};

export const sideText: Record<Schema.Side, string> = {
  SIDE_BUY: t('Buy'),
  SIDE_SELL: t('Sell'),
};

export const tifShort: Record<Schema.OrderTimeInForce, string> = {
  TIME_IN_FORCE_FOK: t('FOK'),
  TIME_IN_FORCE_GFA: t('GFA'),
  TIME_IN_FORCE_GFN: t('GFN'),
  TIME_IN_FORCE_GTC: t('GTC'),
  TIME_IN_FORCE_GTT: t('GTT'),
  TIME_IN_FORCE_IOC: t('IOC'),
};

export const tifFull: Record<Schema.OrderTimeInForce, string> = {
  TIME_IN_FORCE_FOK: t('Fill or Kill'),
  TIME_IN_FORCE_GFA: t('Good for Auction'),
  TIME_IN_FORCE_GFN: t('Good for Normal'),
  TIME_IN_FORCE_GTC: t("Good 'til Cancel"),
  TIME_IN_FORCE_GTT: t("Good 'til Time"),
  TIME_IN_FORCE_IOC: t('Immediate or Cancel'),
};

export const peggedReference: Record<Schema.PeggedReference, string> = {
  PEGGED_REFERENCE_BEST_ASK: 'Best Ask',
  PEGGED_REFERENCE_BEST_BID: 'Best Bid',
  PEGGED_REFERENCE_MID: 'Mid',
};
