import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { Toggle } from './toggle';
import { useState } from 'react';

export default {
  component: Toggle,
  title: 'Toggle',
} as ComponentMeta<typeof Toggle>;

export const Controlled: ComponentStory<typeof Toggle> = () => {
  const [checked, setChecked] = useState('test-1');

  return (
    <form>
      <div className="mb-12">Current checked state: {checked}</div>
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
        className="max-w-[400px]"
      />
    </form>
  );
};

const UncontrolledTemplate: ComponentStory<typeof Toggle> = (args) => (
  <Toggle {...args} />
);

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
