import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { MarketDepthQuery } from '@vegaprotocol/market-depth';

export const generateOrderBook = (
  override?: PartialDeep<MarketDepthQuery>
): MarketDepthQuery => {
  const marketDepth: MarketDepthQuery['market'] = {
    id: 'b2426f67b085ba8fb429f1b529d49372b2d096c6fb6f509f76c5863abb6d969e',
    depth: {
      sell: [
        {
          price: '826338',
          volume: '303',
          numberOfOrders: '8',
          __typename: 'PriceLevel',
        },
        {
          price: '826339',
          volume: '193',
          numberOfOrders: '4',
          __typename: 'PriceLevel',
        },
        {
          price: '826340',
          volume: '316',
          numberOfOrders: '7',
          __typename: 'PriceLevel',
        },
        {
          price: '826341',
          volume: '412',
          numberOfOrders: '9',
          __typename: 'PriceLevel',
        },
        {
          price: '826342',
          volume: '264',
          numberOfOrders: '6',
          __typename: 'PriceLevel',
        },
      ],
      buy: [
        {
          price: '826339',
          volume: '200',
          numberOfOrders: '5',
          __typename: 'PriceLevel',
        },
        {
          price: '826336',
          volume: '1475',
          numberOfOrders: '28',
          __typename: 'PriceLevel',
        },
        {
          price: '826335',
          volume: '193',
          numberOfOrders: '3',
          __typename: 'PriceLevel',
        },
        {
          price: '826334',
          volume: '425',
          numberOfOrders: '8',
          __typename: 'PriceLevel',
        },
        {
          price: '826333',
          volume: '845',
          numberOfOrders: '17',
          __typename: 'PriceLevel',
        },
        {
          price: '826332',
          volume: '248',
          numberOfOrders: '4',
          __typename: 'PriceLevel',
        },
        {
          price: '826331',
          volume: '162',
          numberOfOrders: '3',
          __typename: 'PriceLevel',
        },
        {
          price: '826328',
          volume: '20',
          numberOfOrders: '2',
          __typename: 'PriceLevel',
        },
      ],
      sequenceNumber: '36109974',
      __typename: 'MarketDepth',
    },
    __typename: 'Market',
  };
  const defaultResult = {
    market: marketDepth,
  };

  return merge(defaultResult, override);
};
