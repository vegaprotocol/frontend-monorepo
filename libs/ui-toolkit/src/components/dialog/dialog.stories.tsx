import React, { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Dialog } from './dialog';
import { Button } from '../button';

export default {
  title: 'Dialog',
  component: Dialog,
} as ComponentMeta<typeof Dialog>;

const Template: ComponentStory<typeof Dialog> = (args) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog {...args} open={open} setOpen={setOpen} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  children: 'Content',
};

export const Danger = Template.bind({});
Danger.args = {
  intent: 'danger',
  children: 'Content',
};

export const Warning = Template.bind({});
Warning.args = {
  intent: 'warning',
  children: 'Content',
};

export const Prompt = Template.bind({});
Prompt.args = {
  intent: 'prompt',
  children: 'Content',
};

export const Progress = Template.bind({});
Progress.args = {
  intent: 'progress',
  children: 'Content',
};

export const Success = Template.bind({});
Success.args = {
  intent: 'success',
  children: 'Content',
};

export const Help = Template.bind({});
Help.args = {
  intent: 'help',
  children: 'Content',
};

export const WithContent = Template.bind({});
WithContent.args = {
  intent: 'success',
  title: 'Transaction successful',
  children: (
    <>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Excepturi iure
        praesentium, exercitationem nihil sequi illum nisi dolor doloribus
        consectetur cumque atque perferendis incidunt aut quaerat voluptatibus
        officiis repellat rem quibusdam?
      </p>
      <Button className="block mt-8" variant="secondary">
        Action
      </Button>
    </>
  ),
};
