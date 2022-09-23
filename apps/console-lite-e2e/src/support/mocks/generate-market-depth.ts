import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { MarketDepthQuery } from '@vegaprotocol/market-depth';

export const generateMarketDepth = (
  override?: PartialDeep<MarketDepthQuery>
): MarketDepthQuery => {
  const defaultResult: MarketDepthQuery = {
    market: {
      id: 'a46bd7e5277087723b7ab835844dec3cef8b4445738101269624bf5537d5d423',
      depth: {
        sell: [
          {
            price: '9893007',
            volume: '3',
            numberOfOrders: '3',
            __typename: 'PriceLevel',
          },
          {
            price: '9893010',
            volume: '4',
            numberOfOrders: '4',
            __typename: 'PriceLevel',
          },
          {
            price: '9893012',
            volume: '1',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9893015',
            volume: '1',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9893017',
            volume: '2',
            numberOfOrders: '2',
            __typename: 'PriceLevel',
          },
          {
            price: '9893021',
            volume: '4',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9893025',
            volume: '5',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9893125',
            volume: '4',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9893135',
            volume: '2',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9893165',
            volume: '5',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9893175',
            volume: '3',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9893185',
            volume: '3',
            numberOfOrders: '3',
            __typename: 'PriceLevel',
          },
          {
            price: '9894185',
            volume: '1',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9894585',
            volume: '1',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9895585',
            volume: '4',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9896585',
            volume: '2',
            numberOfOrders: '2',
            __typename: 'PriceLevel',
          },
        ],
        buy: [
          {
            price: '9893005',
            volume: '4',
            numberOfOrders: '3',
            __typename: 'PriceLevel',
          },
          {
            price: '9893003',
            volume: '2',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9893001',
            volume: '1',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9892006',
            volume: '3',
            numberOfOrders: '2',
            __typename: 'PriceLevel',
          },
          {
            price: '9891006',
            volume: '2',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9891001',
            volume: '1',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9890101',
            volume: '2',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9890091',
            volume: '5',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9890081',
            volume: '4',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9890050',
            volume: '2',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9890040',
            volume: '6',
            numberOfOrders: '3',
            __typename: 'PriceLevel',
          },
          {
            price: '9890030',
            volume: '6',
            numberOfOrders: '2',
            __typename: 'PriceLevel',
          },
          {
            price: '9890021',
            volume: '3',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9890011',
            volume: '1',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9890001',
            volume: '11',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
        ],
        sequenceNumber: '1661773865550746910',
        __typename: 'MarketDepth',
      },
      __typename: 'Market',
    },
  };
  return merge(defaultResult, override);
};
