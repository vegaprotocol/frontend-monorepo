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
  children: 'No intent supplied',
};

export const Primary = Template.bind({});
Primary.args = {
  intent: Intent.Primary,
  children: 'Intent: Primary',
};

export const Danger = Template.bind({});
Danger.args = {
  intent: Intent.Danger,
  children: 'Intent: Danger',
};

export const Warning = Template.bind({});
Warning.args = {
  intent: Intent.Warning,
  children: 'Intent: Warning',
};

export const Success = Template.bind({});
Success.args = {
  intent: Intent.Success,
  children: 'Intent: Success',
};

export const IconAndContent = Template.bind({});
IconAndContent.args = {
  intent: Intent.None,
  title: 'This is what this thing does',
  iconName: 'endorsed',
  children: (
    <div>
      <p className="mb-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut impedit ab
        maiores perspiciatis ea fuga dolorum velit molestiae ad consequuntur
        quae, commodi doloribus eligendi veritatis.
      </p>
      <Button>Action</Button>
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
    <div>
      <p className="mb-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit tenetur
        pariatur reprehenderit quis optio quisquam vel, corporis enim a
        exercitationem illo explicabo est labore tempore sint, quibusdam error,
        ipsa nam.
      </p>
      <Button intent={Intent.Secondary}>Action</Button>
    </div>
  ),
};

export const Loading = Template.bind({});
Loading.args = {
  intent: Intent.None,
  title: 'This is what this thing does',
  isLoading: true,
  children: (
    <div>
      <p className="mb-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla tempore
        ab architecto dolores nesciunt aliquid!
      </p>
      <Button>Action</Button>
    </div>
  ),
};
