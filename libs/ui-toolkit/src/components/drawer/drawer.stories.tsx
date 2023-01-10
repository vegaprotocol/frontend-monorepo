import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { Drawer } from './drawer';
import React, { useState } from 'react';
import { Button } from '../button';

export default {
  title: 'Drawer',
  component: Drawer,
} as ComponentMeta<typeof Drawer>;

const Template: ComponentStory<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(args.open);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  return (
    <div ref={setContainer}>
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer {...args} open={open} onChange={setOpen} container={container}>
        {args.children}
      </Drawer>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  open: false,
  children: <p>Some content</p>,
};
