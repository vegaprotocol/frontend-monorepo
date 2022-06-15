import React, { useState } from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';

import { Dialog } from './dialog';
import { Button } from '../button';
import { Intent } from '../../utils/intent';

export default {
  title: 'Dialog',
  component: Dialog,
} as ComponentMeta<typeof Dialog>;

const Template: ComponentStory<typeof Dialog> = (args) => {
  const [open, setOpen] = useState(args.open);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog {...args} open={open} onChange={setOpen}>
        {args.children}
      </Dialog>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  open: false,
  title: 'Title',
  children: <p>Some content</p>,
};

export const Danger = Template.bind({});
Danger.args = {
  open: false,
  title: 'Danger',
  children: <p>Some content</p>,
  intent: Intent.Danger,
};

export const Warning = Template.bind({});
Warning.args = {
  open: false,
  title: 'Warning',
  children: <p>Some content</p>,
  intent: Intent.Warning,
};

export const Success = Template.bind({});
Success.args = {
  open: false,
  title: 'Success',
  children: <p>Some content</p>,
  intent: Intent.Success,
};

export const Help = Template.bind({});
Help.args = {
  open: false,
  title: 'Help',
  children: <p>Some content</p>,
  intent: Intent.Help,
};
