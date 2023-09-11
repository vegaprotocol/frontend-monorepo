import type { Meta, StoryFn } from '@storybook/react';
import type { TradingCheckboxProps } from './checkbox';
import { TradingCheckbox } from './checkbox';

export default {
  component: TradingCheckbox,
  title: 'Checkbox - trading',
} as Meta<typeof TradingCheckbox>;

const Template: StoryFn<TradingCheckboxProps> = (args) => (
  <TradingCheckbox {...args} />
);

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
