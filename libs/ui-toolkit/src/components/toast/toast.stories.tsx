import React, { useState } from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';

import { Toast } from './toast';
import { Button } from '../button';
import { Intent } from '../../utils/intent';

export default {
  title: 'Toast',
  component: Toast,
} as ComponentMeta<typeof Toast>;

const Template: ComponentStory<typeof Toast> = (args) => {
  const [open, setOpen] = useState(args.open);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Toast</Button>
      <Toast {...args} open={open} onOpenChange={setOpen}>
        {args.children}
      </Toast>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  open: false,
  title: 'No intent supplied',
  children: <p>Some content</p>,
};

export const Primary = Template.bind({});
Primary.args = {
  open: false,
  title: 'Intent: Primary',
  children: <p>Some content</p>,
  intent: Intent.Primary,
};

export const Danger = Template.bind({});
Danger.args = {
  open: false,
  title: 'Intent: Danger',
  children: <p>Some content</p>,
  intent: Intent.Danger,
};

export const Warning = Template.bind({});
Warning.args = {
  open: false,
  title: 'Intent: Warning',
  children: <p>Some content</p>,
  intent: Intent.Warning,
};

export const Success = Template.bind({});
Success.args = {
  open: false,
  title: 'Intent: Success',
  children: <p>Some content</p>,
  intent: Intent.Success,
};
