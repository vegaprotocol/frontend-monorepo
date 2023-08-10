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

export const Overflow = Template.bind({});
Overflow.args = {
  name: 'overflow',
  label:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  label: 'Disabled',
};

export const Indeterminate = Template.bind({});
Indeterminate.args = {
  name: 'default',
  checked: 'indeterminate',
  label: 'Indeterminate checkbox',
};
