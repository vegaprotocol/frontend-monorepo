import type { Story, Meta } from '@storybook/react';
import { PositionsTable } from './positions-table';
import type { Position } from './positions-metrics-data-provider';
import { MarketTradingMode } from '@vegaprotocol/types';

export default {
  component: PositionsTable,
  title: 'PositionsTable',
} as Meta;

const Template: Story = (args) => <PositionsTable {...args} />;

export const Primary = Template.bind({});
const longPosition: Position = {
  marketName: 'BTC/USD (31 july 2022)',
  averageEntryPrice: '1134564',
  capitalUtilisation: 10.0,
  currentLeverage: 11,
  assetDecimals: 2,
  marketDecimalPlaces: 2,
  positionDecimalPlaces: 2,
  // generalAccountBalance: '0',
  totalBalance: '45353',
  assetSymbol: 'BTC',
  // leverageInitial: '0',
  // leverageMaintenance: '0',
  // leverageRelease: '0',
  // leverageSearch: '0',
  liquidationPrice: '1129935',
  lowMarginLevel: false,
  // marginAccountBalance: '0',
  // marginMaintenance: '0',
  // marginSearch: '0',
  // marginInitial: '0',
  marketId: 'marketId1',
  marketTradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
  markPrice: '1131894',
  notional: '46667989',
  openVolume: '4123',
  realisedPNL: '45',
  unrealisedPNL: '45',
  searchPrice: '1132123',
  updatedAt: '2022-07-27T15:02:58.400Z',
};

const shortPosition: Position = {
  marketName: 'ETH/USD (31 august 2022)',
  averageEntryPrice: '23976',
  capitalUtilisation: 87.0,
  currentLeverage: 7,
  assetDecimals: 2,
  marketDecimalPlaces: 2,
  positionDecimalPlaces: 2,
  // generalAccountBalance: '0',
  totalBalance: '3856',
  assetSymbol: 'ETH',
  // leverageInitial: '0',
  // leverageMaintenance: '0',
  // leverageRelease: '0',
  // leverageSearch: '0',
  liquidationPrice: '23734',
  lowMarginLevel: false,
  // marginAccountBalance: '0',
  // marginMaintenance: '0',
  // marginSearch: '0',
  // marginInitial: '0',
  marketId: 'marketId2',
  marketTradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
  markPrice: '24123',
  notional: '836344',
  openVolume: '-3467',
  realisedPNL: '0',
  unrealisedPNL: '0',
  searchPrice: '0',
  updatedAt: '2022-07-26T14:01:34.800Z',
};

Primary.args = {
  rowData: [longPosition, shortPosition],
};
