import React from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';

import { Callout } from './callout';
import { Button } from '../button';
import { Intent } from '../../utils/intent';

export default {
  title: 'Callout',
  component: Callout,
  argTypes: {
    title: {
      type: 'string',
    },
  },
} as ComponentMeta<typeof Callout>;

const Template: ComponentStory<typeof Callout> = (args) => (
  <Callout {...args} />
);

export const Default = Template.bind({});
Default.args = {
  children: 'Content',
};

export const Primary = Template.bind({});
Primary.args = {
  intent: Intent.Primary,
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
  intent: Intent.None,
  title: 'This is what this thing does',
  iconName: 'endorsed',
  children: (
    <div className="flex flex-col">
      <div>With a longer explanation</div>
      <Button className="block mt-8" variant="secondary">
        Action
      </Button>
    </div>
  ),
};

export const CustomIconAndContent = Template.bind({});
CustomIconAndContent.args = {
  intent: Intent.None,
  title: 'This is what this thing does',
  icon: (
    <span role="img" aria-label="tick">
      ✔️
    </span>
  ),
  children: (
    <div className="flex flex-col">
      <div>With a longer explanation</div>
      <Button className="block mt-8" variant="secondary">
        Action
      </Button>
    </div>
  ),
};

export const Loading = Template.bind({});
Loading.args = {
  intent: Intent.None,
  title: 'This is what this thing does',
  isLoading: true,
  children: (
    <div className="flex flex-col">
      <div>With a longer explanation</div>
      <Button className="block mt-8" variant="secondary">
        Action
      </Button>
    </div>
  ),
};
