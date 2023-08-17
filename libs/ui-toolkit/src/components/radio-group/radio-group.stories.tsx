import type { Story, Meta } from '@storybook/react';
import type { RadioGroupProps } from './radio-group';
import { RadioGroup, Radio } from './radio-group';

export default {
  component: RadioGroup,
  title: 'RadioGroup',
} as Meta;

const Template: Story<RadioGroupProps> = (args) => (
  <RadioGroup {...args}>
    <Radio id="item-1" value="1" label="Item 1" />
    <Radio id="item-2" value="2" label="Item 2" />
    <Radio id="item-3" value="3" label="Disabled item" disabled={true} />
  </RadioGroup>
);

export const Vertical = Template.bind({});
export const Horizontal = Template.bind({});
Horizontal.args = {
  orientation: 'horizontal',
};
