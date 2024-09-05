import type {
  FillsQuery,
  FillFieldsFragment,
  FillsEventSubscription,
} from './__generated__/Fills';
import * as Schema from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const fillsQuery = (
  override?: PartialDeep<FillsQuery>,
  vegaPublicKey?: string
): FillsQuery => {
  const defaultResult: FillsQuery = {
    trades: {
      __typename: 'TradeConnection',
      edges: fills(vegaPublicKey).map((node) => ({
        __typename: 'TradeEdge',
        cursor: '3',
        node,
      })),
      pageInfo: {
        __typename: 'PageInfo',
        startCursor: '1',
        endCursor: '2',
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
  };

  return merge(defaultResult, override);
};

export const generateFill = (override?: PartialDeep<FillFieldsFragment>) => {
  const defaultFill: FillFieldsFragment = {
    __typename: 'Trade',
    id: '0',
    createdAt: new Date().toISOString(),
    price: '10000000',
    size: '50000',
    buyOrder: 'buy-order',
    sellOrder: 'sell-order',
    aggressor: Schema.Side.SIDE_BUY,
    buyer: {
      __typename: 'Party',
      id: 'buyer-id',
    },
    seller: {
      __typename: 'Party',
      id: 'seller-id',
    },
    buyerFee: {
      __typename: 'TradeFee',
      makerFee: '100',
      infrastructureFee: '100',
      liquidityFee: '100',
      treasuryFee: '0',
      buyBackFee: '0',
      highVolumeMakerFee: '0',
    },
    sellerFee: {
      __typename: 'TradeFee',
      makerFee: '200',
      infrastructureFee: '200',
      liquidityFee: '200',
      treasuryFee: '0',
      buyBackFee: '0',
      highVolumeMakerFee: '0',
    },
    market: {
      __typename: 'Market',
      id: 'market-0',
    },
  };

  return merge(defaultFill, override);
};

export const fillFieldsFragment = (
  override?: PartialDeep<FillFieldsFragment>
): FillFieldsFragment => {
  const defaultFill: FillFieldsFragment = {
    __typename: 'Trade',
    id: '0',
    createdAt: new Date().toISOString(),
    price: '10000000',
    size: '50000',
    buyOrder: 'buy-order',
    sellOrder: 'sell-order',
    aggressor: Schema.Side.SIDE_BUY,
    buyer: {
      __typename: 'Party',
      id: 'buyer-id',
    },
    seller: {
      __typename: 'Party',
      id: 'seller-id',
    },
    buyerFee: {
      __typename: 'TradeFee',
      makerFee: '100',
      infrastructureFee: '100',
      liquidityFee: '100',
      treasuryFee: '0',
      buyBackFee: '0',
      highVolumeMakerFee: '0',
    },
    sellerFee: {
      __typename: 'TradeFee',
      makerFee: '200',
      infrastructureFee: '200',
      liquidityFee: '200',
      treasuryFee: '0',
      buyBackFee: '0',
      highVolumeMakerFee: '0',
    },
    market: {
      __typename: 'Market',
      id: 'market-0',
    },
  };

  return merge(defaultFill, override);
};

const fills = (id?: string): FillFieldsFragment[] => [
  fillFieldsFragment({
    buyer: {
      id: id || 'buyer-id',
    },
  }),
  fillFieldsFragment({
    id: '1',
    seller: {
      id: id || 'seller-id',
    },
    aggressor: Schema.Side.SIDE_SELL,
    buyerFee: {
      infrastructureFee: '5000',
    },
    market: {
      id: 'market-1',
    },
  }),
  fillFieldsFragment({
    id: '2',
    seller: {
      id: id || 'seller-id',
    },
    aggressor: Schema.Side.SIDE_BUY,
  }),
  fillFieldsFragment({
    id: '3',
    aggressor: Schema.Side.SIDE_SELL,
    market: {
      id: 'market-2',
    },
    buyer: {
      id: id || 'buyer-id',
    },
  }),
  fillFieldsFragment({
    id: '4',
    aggressor: Schema.Side.SIDE_UNSPECIFIED,
    market: {
      id: 'market-2',
    },
    buyer: {
      id: id || 'buyer-id',
    },
  }),
];

export const fillsEventSubscription = (
  override?: PartialDeep<FillsEventSubscription>
): FillsEventSubscription => {
  const defaultResult: FillsEventSubscription = {
    __typename: 'Subscription',
    tradesStream: [
      {
        __typename: 'TradeUpdate',
        id: '0',
        marketId: 'market-0',
        buyOrder: 'buy-order',
        sellOrder: 'sell-order',
        buyerId: 'buyer-id',
        sellerId: 'seller-id',
        aggressor: Schema.Side.SIDE_BUY,
        price: '10000000',
        size: '50000',
        createdAt: new Date().toISOString(),
        type: Schema.TradeType.TYPE_DEFAULT,
        buyerFee: {
          __typename: 'TradeFee',
          makerFee: '100',
          infrastructureFee: '100',
          liquidityFee: '100',
          treasuryFee: '0',
          buyBackFee: '0',
          highVolumeMakerFee: '0',
        },
        sellerFee: {
          __typename: 'TradeFee',
          makerFee: '200',
          infrastructureFee: '200',
          liquidityFee: '200',
          treasuryFee: '0',
          buyBackFee: '0',
          highVolumeMakerFee: '0',
        },
      },
    ],
  };
  return merge(defaultResult, override);
};
