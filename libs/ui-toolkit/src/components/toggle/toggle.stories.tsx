import type { ComponentStory, Meta, Story } from '@storybook/react';
import type { ToggleProps } from './toggle';
import { Toggle } from './toggle';
import { useState } from 'react';

export default {
  component: Toggle,
  title: 'Toggle',
} as Meta;

const Template: Story<ToggleProps> = (args) => (
  <form className="w-[300px]">
    <Toggle {...args} />
  </form>
);

export const Controlled: ComponentStory<typeof Toggle> = () => {
  const [checked, setChecked] = useState('test-1');

  return (
    <form className="w-[600px]">
      <div className="mb-4">Current checked state: {checked}</div>
      <Toggle
        name="controlled"
        toggles={[
          {
            label: 'Option 1',
            value: 'test-1',
          },
          {
            label: 'Option 2',
            value: 'test-2',
          },
        ]}
        checkedValue={checked}
        onChange={(e) => setChecked(e.target.value)}
      />
    </form>
  );
};

export const Uncontrolled = Template.bind({});
Uncontrolled.args = {
  name: 'uncontrolled',
  toggles: [
    {
      label: 'Option 1',
      value: 'test-1',
    },
    {
      label: 'Option 2',
      value: 'test-2',
    },
  ],
};

export const MoreButtons = Template.bind({});
MoreButtons.args = {
  name: 'more',
  toggles: [
    {
      label: 'Option 1',
      value: 'test-1',
    },
    {
      label: 'Option 2',
      value: 'test-2',
    },
    {
      label: 'Option 3',
      value: 'test-3',
    },
  ],
};
