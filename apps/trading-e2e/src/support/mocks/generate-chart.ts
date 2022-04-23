import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type {
  Chart,
  Chart_market_data_priceMonitoringBounds,
} from '@vegaprotocol/chart';

export const generateChart = (override?: PartialDeep<Chart>): Chart => {
  const priceMonitoringBound: Chart_market_data_priceMonitoringBounds = {
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
