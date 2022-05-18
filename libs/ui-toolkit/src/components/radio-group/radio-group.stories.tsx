import type { Story, Meta } from '@storybook/react';
import { RadioGroup, Radio } from './radio-group';

export default {
  component: RadioGroup,
  title: 'RadioGroup',
} as Meta;

const Template: Story = (args) => (
  <RadioGroup>
    <Radio id="item-1" value="1" label="Item 1" />
    <Radio id="item-2" value="2" label="Item 2" />
    <Radio id="item-3" value="3" label="Disabled item" disabled={true} />
    <Radio id="item-3" value="3" label="Error" hasError={true} />
  </RadioGroup>
);

export const Default = Template.bind({});
