import React, { useState } from 'react';

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
        open={open}
        onOpenChange={setOpen}
        trigger={<Button variant="primary">Trigger</Button>}
      >
        {args.children}
      </Popover>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  open: false,
  children: (
    <div>
      <h2 className="text-lg">Some information</h2>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid alias
        labore necessitatibus officiis, quos quo.
      </p>
    </div>
  ),
};
