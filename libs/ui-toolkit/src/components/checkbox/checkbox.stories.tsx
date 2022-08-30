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
  label: 'Check me out!',
};

export const Disabled = Template.bind({});
Disabled.args = {
  checked: false,
  disabled: true,
};
