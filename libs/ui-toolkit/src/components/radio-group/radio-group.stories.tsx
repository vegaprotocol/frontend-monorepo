import type { Story, Meta } from '@storybook/react';
import { RadioGroup, RadioItem } from './radio-group';

export default {
  component: RadioGroup,
  title: 'RadioGroup',
} as Meta;

const Template: Story = (args) => (
  <RadioGroup>
    <RadioItem id="item-1" value="1" label="Item 1" />
    <RadioItem id="item-2" value="2" label="Item 2" />
    <RadioItem id="item-3" value="3" label="Disabled item" disabled={true} />
  </RadioGroup>
);

export const Default = Template.bind({});
