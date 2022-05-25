import type { Story, Meta } from '@storybook/react';
import { compactRows, mapMarketData } from './orderbook-data';
import { Orderbook } from './orderbook';
import type {
  MarketDepth_market_depth_sell,
  MarketDepth_market_depth_buy,
} from './__generated__/MarketDepth';
import { MarketTradingMode } from '@vegaprotocol/types';
import { useState } from 'react';

interface Props {
  numberOfSellRows: number;
  numberOfBuyRows: number;
  overlap: number;
  midPrice: number;
  decimalPlaces: number;
  bestStaticBidPrice: number;
  bestStaticOfferPrice: number;
  indicativePrice?: number;
  indicativeVolume?: number;
}

const OrderbokMockDataProvider = ({
  numberOfSellRows,
  numberOfBuyRows,
  midPrice,
  overlap,
  decimalPlaces,
  bestStaticBidPrice,
  bestStaticOfferPrice,
  indicativePrice,
  indicativeVolume,
}: Props) => {
  const [resolution, setResolution] = useState(1);
  let matrix = new Array(numberOfSellRows).fill(undefined);
  let price =
    midPrice + (numberOfSellRows - Math.ceil(overlap / 2) + 1) * resolution;
  const sell: MarketDepth_market_depth_sell[] = matrix.map((row, i) => ({
    __typename: 'PriceLevel',
    price: (price -= resolution).toString(),
    volume: (numberOfSellRows - i + 1).toString(),
    numberOfOrders: '',
  }));
  price += overlap * resolution;
  matrix = new Array(numberOfBuyRows).fill(undefined);
  const buy: MarketDepth_market_depth_buy[] = matrix.map((row, i) => ({
    __typename: 'PriceLevel',
    price: (price -= resolution).toString(),
    volume: (i + 2).toString(),
    numberOfOrders: '',
  }));
  const rows = compactRows(sell, buy, resolution);
  return (
    <div className="absolute inset-0 dark:bg-black dark:text-white-60 bg-white text-black-60">
      <div
        className="absolute left-0 top-0 bottom-0"
        style={{ width: '400px' }}
      >
        <Orderbook
          rows={rows}
          decimalPlaces={decimalPlaces}
          resolution={resolution}
          onResolutionChange={setResolution}
          marketTradingMode={
            overlap > 0
              ? MarketTradingMode.BatchAuction
              : MarketTradingMode.Continuous
          }
          indicativeVolume={indicativeVolume?.toString()}
          {...mapMarketData(
            {
              __typename: 'MarketData',
              staticMidPrice: '',
              marketTradingMode:
                overlap > 0
                  ? MarketTradingMode.BatchAuction
                  : MarketTradingMode.Continuous,
              bestStaticBidPrice: bestStaticBidPrice.toString(),
              bestStaticOfferPrice: bestStaticOfferPrice.toString(),
              indicativePrice: indicativePrice?.toString() ?? '',
              indicativeVolume: indicativeVolume?.toString() ?? '',
              market: {
                __typename: 'Market',
                id: '',
              },
            },
            resolution
          )}
        />
      </div>
    </div>
  );
};

export default {
  component: OrderbokMockDataProvider,
  title: 'Orderbook',
} as Meta;

const Template: Story<Props> = (args) => <OrderbokMockDataProvider {...args} />;

export const Continuous = Template.bind({});
Continuous.args = {
  numberOfSellRows: 100,
  numberOfBuyRows: 100,
  midPrice: 1000,
  bestStaticBidPrice: 1000,
  bestStaticOfferPrice: 1000,
  decimalPlaces: 3,
  overlap: -1,
};

export const Auction = Template.bind({});
Auction.args = {
  numberOfSellRows: 100,
  numberOfBuyRows: 100,
  midPrice: 122900,
  bestStaticBidPrice: 122905,
  bestStaticOfferPrice: 122895,
  decimalPlaces: 3,
  overlap: 10,
  indicativePrice: 122900,
  indicativeVolume: 11,
};

export const Empty = Template.bind({});
Empty.args = {
  numberOfSellRows: 0,
  numberOfBuyRows: 0,
  midPrice: 0,
  bestStaticBidPrice: 0,
  bestStaticOfferPrice: 0,
  decimalPlaces: 3,
  overlap: 0,
  indicativePrice: 0,
  indicativeVolume: 0,
};
