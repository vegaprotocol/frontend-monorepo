import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import type { MarketDepthQuery } from '../../../../../libs/market-depth/src/lib/__generated__/MarketDepth';

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
            price: '9891005',
            volume: '4',
            numberOfOrders: '3',
            __typename: 'PriceLevel',
          },
          {
            price: '9890003',
            volume: '2',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9889001',
            volume: '1',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9888006',
            volume: '3',
            numberOfOrders: '2',
            __typename: 'PriceLevel',
          },
          {
            price: '9887006',
            volume: '2',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9886001',
            volume: '1',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9885101',
            volume: '2',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9884091',
            volume: '5',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9883081',
            volume: '4',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9882050',
            volume: '2',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9881040',
            volume: '6',
            numberOfOrders: '3',
            __typename: 'PriceLevel',
          },
          {
            price: '9880030',
            volume: '6',
            numberOfOrders: '2',
            __typename: 'PriceLevel',
          },
          {
            price: '9879021',
            volume: '3',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9878011',
            volume: '1',
            numberOfOrders: '1',
            __typename: 'PriceLevel',
          },
          {
            price: '9877001',
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
