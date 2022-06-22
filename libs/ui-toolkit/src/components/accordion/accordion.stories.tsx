import type { Story, Meta } from '@storybook/react';
import { Accordion } from './accordion';

export default {
  component: Accordion,
  title: 'Accordion',
} as Meta;

const Template: Story = (args) => <Accordion panels={args.panels} />;

export const Default = Template.bind({});
Default.args = {
  panels: [
    {
      title: 'Title of expansion panel',
      content: 'Lorem ipsum',
    },
    {
      title: 'Title of expansion panel',
      content: 'Lorem ipsum',
    },
    {
      title: 'Title of expansion panel',
      content: 'Lorem ipsum',
    },
  ],
};
