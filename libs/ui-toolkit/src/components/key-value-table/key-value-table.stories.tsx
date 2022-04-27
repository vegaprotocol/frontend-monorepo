import type { Story, Meta } from '@storybook/react';
import { KeyValueTable, KeyValueTableRow } from './key-value-table';

export default {
  component: KeyValueTable,
  title: 'KeyValueTable',
} as Meta;

const Template: Story = (args) => (
  <KeyValueTable>
    <KeyValueTableRow {...args}>
      {'Token address'}
      {'0x888'}
    </KeyValueTableRow>
    <KeyValueTableRow {...args}>
      {'Value'}
      {888}
    </KeyValueTableRow>
    <KeyValueTableRow {...args}>
      {'Token address'}
      {'0x888'}
    </KeyValueTableRow>
  </KeyValueTable>
);

export const Muted = Template.bind({});
Muted.args = {
  muted: true,
  numerical: false,
};

export const Numerical = Template.bind({});
Numerical.args = {
  muted: false,
  numerical: true,
};

export const Normal = Template.bind({});
Normal.args = {
  muted: false,
  numerical: false,
};
