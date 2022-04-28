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
  label: 'muted key-value-table',
  labelFor: 'muted key-value-table',
  muted: true,
  numerical: false,
};

export const Numerical = Template.bind({});
Numerical.args = {
  title: 'Numerical table',
  label: 'numerical key-value-table',
  labelFor: 'numerical key-value-table',
  muted: false,
  numerical: true,
};

export const Normal = Template.bind({});
Normal.args = {
  title: 'Normal table',
  label: 'normal key-value-table',
  labelFor: 'normal key-value-table',
  muted: false,
  numerical: false,
};
