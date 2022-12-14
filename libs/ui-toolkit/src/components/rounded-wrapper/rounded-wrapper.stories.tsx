import { RoundedWrapper } from './rounded-wrapper';
import type { Story, Meta } from '@storybook/react';
import { KeyValueTable, KeyValueTableRow } from '../key-value-table';

export default {
  component: RoundedWrapper,
  title: 'RoundedWrapper',
} as Meta;

const Template: Story = (args) => (
  <div className="mb-8">
    <RoundedWrapper {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  children: 'Rounded wrapper for presentation purposes',
  paddingBottom: true,
};

export const SurroundingKeyValueTable = Template.bind({});
SurroundingKeyValueTable.args = {
  children: (
    <KeyValueTable>
      <KeyValueTableRow>
        Item 1<span>123.45</span>
      </KeyValueTableRow>
      <KeyValueTableRow noBorder={true}>
        Item 2<span>543.21</span>
      </KeyValueTableRow>
    </KeyValueTable>
  ),
};
