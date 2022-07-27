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
Primary.args = {
  rowData: [
    {
      averageEntryPrice: BigInt(0),
      capitalUtilisation: BigInt(0),
      currentLeverage: BigInt(0),
      decimalPlaces: 2,
      generalAccountBalance: BigInt(0),
      instrumentName: 'BTCUSD',
      leverageInitial: BigInt(0),
      leverageMaintenance: BigInt(0),
      leverageRelease: BigInt(0),
      leverageSearch: BigInt(0),
      liquidationPrice: BigInt(0),
      marginAccountBalance: BigInt(0),
      marginMaintenance: BigInt(0),
      marginSearch: BigInt(0),
      marketId: 'string',
      marketTradingMode: MarketTradingMode.Continuous,
      markPrice: BigInt(0),
      notional: BigInt(0),
      openVolume: BigInt(0),
      realisedPNL: BigInt(0),
      searchPrice: BigInt(0),
      updatedAt: null,
    },
  ] as Position[],
};
