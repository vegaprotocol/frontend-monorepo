import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

// TODO: Figure out how to get types
// eslint-disable-next-line
type Chart = any;

export const generateChart = (override?: PartialDeep<Chart>): Chart => {
  const priceMonitoringBound = {
    minValidPrice: '16256291',
    maxValidPrice: '18296869',
    referencePrice: '17247489',
    __typename: 'PriceMonitoringBounds',
  };
  const defaultResult = {
    market: {
      decimalPlaces: 5,
      data: {
        priceMonitoringBounds: [priceMonitoringBound],
        __typename: 'MarketData',
      },
      __typename: 'Market',
    },
  };

  return merge(defaultResult, override);
};
