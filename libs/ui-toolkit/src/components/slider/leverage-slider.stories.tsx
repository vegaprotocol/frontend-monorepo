import type { Story, Meta } from '@storybook/react';
import { LeverageSlider } from './leverage-slider';
import { useState } from 'react';

export default {
  component: LeverageSlider,
  title: 'LeverageSlider',
} as Meta;

const Template: Story = ({ value: val, min, max, ...args }) => {
  const [value, setValue] = useState(val);

  const onValueChange = (val: [number]) => {
    setValue(val);
  };

  return (
    <>
      <LeverageSlider
        onValueChange={onValueChange}
        value={value}
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
  step: 0.1,
  value: [100],
};
