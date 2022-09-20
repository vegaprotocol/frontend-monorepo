import type { Story, Meta } from '@storybook/react';
import type { Props } from './fills-table';
import { FillsTable } from './fills-table';
import { generateFill } from './test-helpers';

export default {
  component: FillsTable,
  title: 'FillsTable',
} as Meta;

const Template: Story<Props> = (args) => <FillsTable {...args} />;
export const Default = Template.bind({});

Default.args = {
  partyId: 'party-id',
  rowData: Array(5)
    .fill(null)
    .map(() => generateFill()),
};
