import { type ApolloError } from '@apollo/client';
import { getUserLocale } from '@vegaprotocol/utils';

export const BORDER_COLOR = 'border-gs-500 ';
export const GRADIENT = 'bg-gradient-to-b from-gs-800 to-transparent';

// TODO: Update the links to use the correct referral related pages
export const REFERRAL_DOCS_LINK =
  'https://docs.vega.xyz/mainnet/concepts/trading-on-vega/discounts-rewards#referral-program';
export const ABOUT_REFERRAL_DOCS_LINK =
  'https://docs.vega.xyz/mainnet/concepts/trading-on-vega/discounts-rewards#referral-program';
export const DISCLAIMER_REFERRAL_DOCS_LINK = 'https://docs.vega.xyz/';

export const DEFAULT_AGGREGATION_DAYS = 30;

export type StatValue<T> = {
  value: T;
  loading: boolean;
  error?: ApolloError | Error;
};

export const COMPACT_NUMBER_FORMAT = (maximumFractionDigits = 2) =>
  new Intl.NumberFormat(getUserLocale(), {
    minimumFractionDigits: 0,
    maximumFractionDigits,
    notation: 'compact',
    compactDisplay: 'short',
  });
