import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type {
  MarketDepthQuery,
  MarketDepthUpdateSubscription,
  PriceLevelFieldsFragment,
} from './__generated__/MarketDepth';

export const marketDepthQuery = (
  override?: PartialDeep<MarketDepthQuery>
): MarketDepthQuery => {
  const defaultResult: MarketDepthQuery = {
    market: {
      id: 'market-0',
      depth: {
        __typename: 'MarketDepth',
        buy,
        sell,
        sequenceNumber: '1',
      },
      __typename: 'Market',
    },
  };
  return merge(defaultResult, override);
};

export const marketDepthUpdateSubscription = (
  override?: PartialDeep<MarketDepthUpdateSubscription>
): MarketDepthUpdateSubscription => {
  const defaultResult: MarketDepthUpdateSubscription = {
    __typename: 'Subscription',
    marketsDepthUpdate: [
      {
        __typename: 'ObservableMarketDepthUpdate',
        marketId: 'market-0',
        buy: priceLevelFieldsFragments,
        sell: priceLevelFieldsFragments,
        sequenceNumber: '',
        previousSequenceNumber: '',
      },
    ],
  };
  return merge(defaultResult, override);
};

const priceLevelFieldsFragments: PriceLevelFieldsFragment[] = [
  {
    price: '9893007',
    volume: '3',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '3',
    __typename: 'PriceLevel',
  },
];

const sell: PriceLevelFieldsFragment[] = [
  {
    price: '9893007',
    volume: '3',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '3',
    __typename: 'PriceLevel',
  },
  {
    price: '9893010',
    volume: '4',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '4',
    __typename: 'PriceLevel',
  },
  {
    price: '9893012',
    volume: '1',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9893015',
    volume: '1',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9893017',
    volume: '2',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '2',
    __typename: 'PriceLevel',
  },
  {
    price: '9893021',
    volume: '4',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9893025',
    volume: '5',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9893125',
    volume: '4',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9893135',
    volume: '2',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9893165',
    volume: '5',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9893175',
    volume: '3',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9893185',
    volume: '3',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '3',
    __typename: 'PriceLevel',
  },
  {
    price: '9894185',
    volume: '1',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9894585',
    volume: '1',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9895585',
    volume: '4',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9896585',
    volume: '2',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '2',
    __typename: 'PriceLevel',
  },
];
const buy: PriceLevelFieldsFragment[] = [
  {
    price: '9891005',
    volume: '4',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '3',
    __typename: 'PriceLevel',
  },
  {
    price: '9890003',
    volume: '2',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9889001',
    volume: '1',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9888006',
    volume: '3',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '2',
    __typename: 'PriceLevel',
  },
  {
    price: '9887006',
    volume: '2',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9886001',
    volume: '1',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9885101',
    volume: '2',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9884091',
    volume: '5',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9883081',
    volume: '4',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9882050',
    volume: '2',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9881040',
    volume: '6',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '3',
    __typename: 'PriceLevel',
  },
  {
    price: '9880030',
    volume: '6',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '2',
    __typename: 'PriceLevel',
  },
  {
    price: '9879021',
    volume: '3',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9878011',
    volume: '1',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
  {
    price: '9877001',
    volume: '11',
    ammVolume: '0',
    ammVolumeEstimated: '0',
    numberOfOrders: '1',
    __typename: 'PriceLevel',
  },
];
