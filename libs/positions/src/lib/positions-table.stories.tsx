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
const position: Position = {
  marketName: 'ETH/BTC (31 july 2022)',
  averageEntryPrice: '0',
  capitalUtilisation: '0',
  currentLeverage: '0',
  decimalPlaces: 2,
  generalAccountBalance: '0',
  totalBalance: '0',
  instrumentName: 'BTCUSD',
  // leverageInitial: '0',
  // leverageMaintenance: '0',
  // leverageRelease: '0',
  // leverageSearch: '0',
  liquidationPrice: '0',
  marginAccountBalance: '0',
  marginMaintenance: '0',
  marginSearch: '0',
  marketId: 'string',
  marketTradingMode: MarketTradingMode.Continuous,
  markPrice: '0',
  notional: '0',
  openVolume: '0',
  realisedPNL: '0',
  searchPrice: '0',
  updatedAt: '2022-07-27T15:02:58.400Z',
};

Primary.args = {
  rowData: [position],
};
