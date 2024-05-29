import type { Story, Meta } from '@storybook/react';
import { PercentageSlider } from './percentage-slider';
import { useState } from 'react';

export default {
  component: PercentageSlider,
  title: 'PercentageSlider',
} as Meta;

const Template: Story = ({ value: val, min, max, ...args }) => {
  const [value, setValue] = useState(val);

  const onValueChange = (val: [number]) => {
    setValue(val);
  };

  return (
    <>
      <PercentageSlider
        onValueChange={onValueChange}
        value={value}
        min={min}
        max={max}
        {...args}
      />
      <div className="mt-10">{value}</div>
    </>
  );
};

export const Default = Template.bind({});

Default.args = {
  max: 100,
  min: 20,
  step: 0.1,
  value: [55],
};
