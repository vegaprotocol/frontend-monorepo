import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Callout } from './callout';
import { Button } from '../button';
import { Intent } from '../../utils/intent';

export default {
  title: 'Callout',
  component: Callout,
} as ComponentMeta<typeof Callout>;

const Template: ComponentStory<typeof Callout> = (args) => (
  <Callout {...args} />
);

export const Default = Template.bind({});
Default.args = {
  children: 'Content',
};

export const Danger = Template.bind({});
Danger.args = {
  intent: Intent.Danger,
  children: 'Content',
};

export const Warning = Template.bind({});
Warning.args = {
  intent: Intent.Warning,
  children: 'Content',
};

export const Prompt = Template.bind({});
Prompt.args = {
  intent: Intent.Prompt,
  children: 'Content',
};

export const Progress = Template.bind({});
Progress.args = {
  intent: Intent.Progress,
  children: 'Content',
};

export const Success = Template.bind({});
Success.args = {
  intent: Intent.Success,
  children: 'Content',
};

export const Help = Template.bind({});
Help.args = {
  intent: Intent.Help,
  children: 'Content',
};

export const IconAndContent = Template.bind({});
IconAndContent.args = {
  intent: Intent.Help,
  title: 'This is what this thing does',
  iconName: 'endorsed',
  children: (
    <div className="flex flex-col">
      <div>With a longer explaination</div>
      <Button className="block mt-8" variant="secondary">
        Action
      </Button>
    </div>
  ),
};
