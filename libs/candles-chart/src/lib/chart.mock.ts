import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { ChartQuery } from './__generated__/Chart';
import type * as Schema from '@vegaprotocol/types';

export const chartQuery = (override?: PartialDeep<ChartQuery>): ChartQuery => {
  const priceMonitoringBound: Schema.PriceMonitoringBounds = {
    minValidPrice: '16256291',
    maxValidPrice: '18296869',
    referencePrice: '17247489',
    trigger: {
      __typename: 'PriceMonitoringTrigger',
      auctionExtensionSecs: 1,
      horizonSecs: 0,
      probability: 0,
    },
    __typename: 'PriceMonitoringBounds',
  };

  const defaultResult: ChartQuery = {
    market: {
      decimalPlaces: 5,
      positionDecimalPlaces: 0,
      data: {
        priceMonitoringBounds: [priceMonitoringBound],
        __typename: 'MarketData',
      },
      __typename: 'Market',
    },
  };

  return merge(defaultResult, override);
};
