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
  const openButton = <Button onClick={() => setOpen(true)}>Open drawer</Button>;
  return (
    <div ref={setContainer}>
      <Drawer
        {...args}
        open={open}
        onChange={setOpen}
        container={container}
        trigger={openButton}
      >
        {args.children}
      </Drawer>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  open: false,
  children: (
    <p className="h-full bg-black dark:bg-white text-white dark:text-black">
      Some content
    </p>
  ),
};
