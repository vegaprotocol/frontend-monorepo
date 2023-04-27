import type { Story, ComponentMeta } from '@storybook/react';
import type { SwitchProps } from './switch';
import { Switch } from './switch';
import { useState } from 'react';

export default {
  component: Switch,
  title: 'Switch',
} as ComponentMeta<typeof Switch>;

const Template: Story<SwitchProps> = (args) => {
  const [checked, setChecked] = useState(args.checked || false);
  return (
    <Switch
      {...args}
      checked={checked}
      onCheckedChange={(checked) => setChecked(checked)}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  name: 'switch',
};

export const WithTextLabel = Template.bind({});
WithTextLabel.args = {
  name: 'switch',
  labelText: 'Light mode',
};
