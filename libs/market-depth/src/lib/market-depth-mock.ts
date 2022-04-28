import type {
  MarketDepth_market,
  MarketDepth_market_depth_sell,
  MarketDepth_market_depth_buy,
} from './__generated__/MarketDepth';

const depthRow = (
  price: number
): MarketDepth_market_depth_sell | MarketDepth_market_depth_buy => {
  return {
    __typename: 'PriceLevel',
    price: price.toString(),
    volume: Math.round(Math.random() * 100).toString(),
    numberOfOrders: Math.round(Math.random() * 20).toString(),
  };
};

const sell = (
  price: number,
  numberOfRecords: number
): MarketDepth_market_depth_sell[] => {
  const distance = Math.random() * price * 0.1;
  return new Array(numberOfRecords)
    .fill(null)
    .map(() => depthRow(price + Math.round(Math.random() * distance)));
};

const buy = (
  price: number,
  numberOfRecords: number
): MarketDepth_market_depth_buy[] => {
  const distance = Math.random() * price * 0.1;
  return new Array(numberOfRecords)
    .fill(null)
    .map(() => depthRow(price - Math.round(Math.random() * distance)));
};

export const getMockedData = (id?: string): MarketDepth_market => ({
  __typename: 'Market',
  id: id || '',
  decimalPlaces: 2,
  // "positionDecimalPlaces": 0,
  data: {
    __typename: 'MarketData',
    midPrice: '0',
  },
  depth: {
    __typename: 'MarketDepth',
    lastTrade: {
      __typename: 'Trade',
      price: '12350',
    },
    sell: sell(12350 * 0.99, 100),
    buy: buy(12350, 100),
    sequenceNumber: '118118448',
  },
});
