import type { Story, Meta } from '@storybook/react';
import { KeyValueTable, KeyValueTableRow } from './key-value-table';

export default {
  component: KeyValueTable,
  title: 'KeyValueTable',
} as Meta;

const Template: Story = (args) => (
  <KeyValueTable {...args}>
    <KeyValueTableRow>
      {'Token address'}
      {'0x888'}
    </KeyValueTableRow>
    <KeyValueTableRow>
      {'Value'}
      {888}
    </KeyValueTableRow>
    <KeyValueTableRow>
      {'Token address'}
      {'0x888'}
    </KeyValueTableRow>
  </KeyValueTable>
);

export const Muted = Template.bind({});
Muted.args = {
  title: 'Muted table',
  muted: true,
  numerical: false,
};

export const Numerical = Template.bind({});
Numerical.args = {
  title: 'Numerical table',
  muted: false,
  numerical: true,
};

export const Normal = Template.bind({});
Normal.args = {
  title: 'Normal table',
  muted: false,
  numerical: false,
};
