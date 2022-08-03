import React, { useState } from 'react';

import { Intent } from '../../utils/intent';
import { Button } from '../button';
import { Popover } from './popover';

import type { ComponentStory, ComponentMeta } from '@storybook/react';
export default {
  title: 'Popover',
  component: Popover,
} as ComponentMeta<typeof Popover>;

const Template: ComponentStory<typeof Popover> = (args) => {
  const [open, setOpen] = useState(args.open);
  return (
    <div>
      <Popover
        intent={args.intent}
        open={open}
        onChange={setOpen}
        trigger={<Button variant="accent">Trigger</Button>}
      >
        {args.children}
      </Popover>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  open: false,
  children: <p>Some content</p>,
};

export const Primary = Template.bind({});
Primary.args = {
  open: false,
  intent: Intent.Primary,
  children: <p>Some content</p>,
};

export const Danger = Template.bind({});
Danger.args = {
  open: false,
  children: <p>Some content</p>,
  intent: Intent.Danger,
};

export const Warning = Template.bind({});
Warning.args = {
  open: false,
  children: <p>Some content</p>,
  intent: Intent.Warning,
};

export const Success = Template.bind({});
Success.args = {
  open: false,
  children: <p>Some content</p>,
  intent: Intent.Success,
};
