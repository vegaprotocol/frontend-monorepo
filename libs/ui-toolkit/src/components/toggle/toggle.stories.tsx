import type { Story, Meta } from '@storybook/react';
import { Toggle } from './toggle';
import { useState } from 'react';

export default {
  component: Toggle,
  title: 'Toggle',
} as Meta;

// @ts-ignore args provided after
const UncontrolledTemplate: Story = (args) => <Toggle {...args} />;

const ControlledTemplate: Story = (args) => {
  const [checked, setChecked] = useState('test-1');

  return (
    // @ts-ignore args provided after
    <Toggle
      checkedValue={checked}
      onChange={(e) => setChecked(e.target.value)}
      {...args}
    />
  );
};

export const Uncontrolled = UncontrolledTemplate.bind({});
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
  className: 'max-w-[400px]',
};

export const Controlled = ControlledTemplate.bind({});
Controlled.args = {
  name: 'controlled',
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
  className: 'max-w-[400px]',
};

export const MoreButtons = UncontrolledTemplate.bind({});
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
  className: 'max-w-[600px]',
};
