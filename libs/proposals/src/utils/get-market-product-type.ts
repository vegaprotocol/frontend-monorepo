import type { InstrumentConfiguration, Product } from '@vegaprotocol/types';

// it needs to be adjusted after deploy this https://github.com/vegaprotocol/vega/pull/9003
export const getMarketProductType = (
  instrumentConfiguration: InstrumentConfiguration
) => {
  return 'product' in instrumentConfiguration
    ? (instrumentConfiguration.product as Product).__typename
    : 'futureProduct' in instrumentConfiguration
    ? 'Future'
    : 'spotProduct' in instrumentConfiguration
    ? 'Spot'
    : 'perpetualProduct' in instrumentConfiguration
    ? 'Perpetual'
    : undefined;
};
