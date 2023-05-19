import BigNumber from 'bignumber.js';
import type { Story, Meta } from '@storybook/react';
import { PositionsTable } from './positions-table';
import type { Position } from './positions-data-providers';
import * as Schema from '@vegaprotocol/types';

export default {
  component: PositionsTable,
  title: 'PositionsTable',
} as Meta;

const Template: Story = (args) => (
  <PositionsTable {...args} isReadOnly={false} />
);

export const Primary = Template.bind({});
const longPosition: Position = {
  assetId: 'BTC',
  assetSymbol: 'BTC',
  averageEntryPrice: '1134564',
  currentLeverage: 11,
  decimals: 2,
  lossSocializationAmount: '0',
  marginAccountBalance: new BigNumber('0').toString(),
  marketDecimalPlaces: 2,
  marketId: 'marketId1',
  marketName: 'BTC/USD (31 july 2022)',
  marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
  markPrice: '1131894',
  notional: '46667989',
  openVolume: '4123',
  positionDecimalPlaces: 2,
  realisedPNL: '45',
  status: Schema.PositionStatus.POSITION_STATUS_UNSPECIFIED,
  totalBalance: '45353',
  unrealisedPNL: '45',
  updatedAt: '2022-07-27T15:02:58.400Z',
};

const shortPosition: Position = {
  assetId: 'ETH',
  assetSymbol: 'ETH',
  averageEntryPrice: '23976',
  currentLeverage: 7,
  decimals: 2,
  lossSocializationAmount: '0',
  marginAccountBalance: new BigNumber('0').toString(),
  marketDecimalPlaces: 2,
  marketId: 'marketId2',
  marketName: 'ETH/USD (31 august 2022)',
  marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
  markPrice: '24123',
  notional: '836344',
  openVolume: '-3467',
  positionDecimalPlaces: 2,
  realisedPNL: '0',
  status: Schema.PositionStatus.POSITION_STATUS_UNSPECIFIED,
  totalBalance: '3856',
  unrealisedPNL: '0',
  updatedAt: '2022-07-26T14:01:34.800Z',
};

Primary.args = {
  rowData: [longPosition, shortPosition],
};
