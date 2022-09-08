import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { ChartQuery } from '@vegaprotocol/candles-chart';
import { Schema } from '@vegaprotocol/types';

export const generateChart = (
  override?: PartialDeep<ChartQuery>
): ChartQuery => {
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
