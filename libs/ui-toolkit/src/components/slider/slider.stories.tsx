import type { Story, Meta } from '@storybook/react';
import { Slider } from './slider';
import { useState } from 'react';

export default {
  component: Slider,
  title: 'Slider',
} as Meta;

const Template: Story = ({ value: val, ...args }) => {
  const [value, setValue] = useState(val);

  const onValueChange = (val: [number]) => {
    setValue(val);
  };

  return <Slider onValueChange={onValueChange} value={value} {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  min: 0,
  max: 1000,
  step: 100,
  value: [100],
};
