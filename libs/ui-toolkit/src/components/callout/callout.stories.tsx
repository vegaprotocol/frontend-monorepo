import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Callout } from '.';

export default {
  title: 'Callout',
  component: Callout,
} as ComponentMeta<typeof Callout>;

const Template: ComponentStory<typeof Callout> = (args) => (
  <Callout {...args}>Content</Callout>
);

export const Default = Template.bind({});

export const Danger = Template.bind({});
Danger.args = {
  intent: 'danger',
};

export const Warning = Template.bind({});
Warning.args = {
  intent: 'warning',
};

export const Prompt = Template.bind({});
Prompt.args = {
  intent: 'prompt',
};

export const Progress = Template.bind({});
Progress.args = {
  intent: 'progress',
};

export const Success = Template.bind({});
Success.args = {
  intent: 'success',
};

export const Help = Template.bind({});
Help.args = {
  intent: 'help',
};
