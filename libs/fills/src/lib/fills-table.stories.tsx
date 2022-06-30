import type { Story, Meta } from '@storybook/react';
import type { FillsTableProps } from './fills-table';
import { FillsTable } from './fills-table';
import { generateFills } from './test-helpers';

export default {
  component: FillsTable,
  title: 'FillsTable',
} as Meta;

const Template: Story<FillsTableProps> = (args) => <FillsTable {...args} />;

export const Default = Template.bind({});
const fills = generateFills();
Default.args = {
  partyId: 'party-id',
  fills: fills.party?.tradesPaged.edges.map((e) => e.node),
};
