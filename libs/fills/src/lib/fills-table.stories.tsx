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

const partyId = 'party-id';
Default.args = {
  partyId,
  rowData: [
    generateFill({
      seller: {
        id: partyId,
      },
    }),
    generateFill({
      buyer: {
        id: partyId,
      },
    }),
    generateFill({
      seller: {
        id: partyId,
      },
    }),
    generateFill({
      buyer: {
        id: partyId,
      },
    }),
  ],
};
