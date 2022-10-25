import type { Story, Meta } from '@storybook/react';
import { generateMockData } from './orderbook-data';
import type { MockDataGeneratorParams } from './orderbook-data';
import { Orderbook } from './orderbook';
import { useState } from 'react';

type Props = Omit<MockDataGeneratorParams, 'resolution'> & {
  decimalPlaces: number;
};

const OrderbookMockDataProvider = ({ decimalPlaces, ...props }: Props) => {
  const [resolution, setResolution] = useState(1);
  return (
    <div className="absolute inset-0 dark:bg-black dark:text-neutral-200 bg-white text-neutral-800">
      <div
        className="absolute left-0 top-0 bottom-0"
        style={{ width: '400px' }}
      >
        <Orderbook
          positionDecimalPlaces={0}
          onResolutionChange={setResolution}
          decimalPlaces={decimalPlaces}
          {...generateMockData({ ...props, resolution })}
        />
      </div>
    </div>
  );
};

export default {
  component: OrderbookMockDataProvider,
  title: 'Orderbook',
} as Meta;

const Template: Story<Props> = (args) => (
  <OrderbookMockDataProvider {...args} />
);

export const Continuous = Template.bind({});
Continuous.args = {
  numberOfSellRows: 100,
  numberOfBuyRows: 100,
  bestStaticBidPrice: 1000,
  bestStaticOfferPrice: 1000,
  decimalPlaces: 3,
  overlap: -1,
};

export const Auction = Template.bind({});
Auction.args = {
  numberOfSellRows: 100,
  numberOfBuyRows: 100,
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
  bestStaticBidPrice: 0,
  bestStaticOfferPrice: 0,
  decimalPlaces: 3,
  overlap: 0,
  indicativePrice: 0,
  indicativeVolume: 0,
};
