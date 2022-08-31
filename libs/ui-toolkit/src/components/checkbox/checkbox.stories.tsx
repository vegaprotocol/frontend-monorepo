import type { ComponentMeta, Story } from '@storybook/react';
import type { CheckboxProps } from './checkbox';
import { Checkbox } from './checkbox';

export default {
  component: Checkbox,
  title: 'Checkbox',
} as ComponentMeta<typeof Checkbox>;

const Template: Story<CheckboxProps> = (args) => <Checkbox {...args} />;

export const Default = Template.bind({});
Default.args = {
  name: 'default',
  label: 'Regular checkbox',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const Indeterminate = Template.bind({});
Indeterminate.args = {
  name: 'default',
  checked: 'indeterminate',
  label: 'Indeterminate checkbox',
};
