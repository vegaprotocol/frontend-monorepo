import type { Story, Meta } from '@storybook/react';
import { Accordion } from './accordion';

export default {
  component: Accordion,
  title: 'Accordion',
} as Meta;

const Template: Story = (args) => (
  <Accordion title={args.title} content={args.content} />
);

export const Default = Template.bind({});
Default.args = {
  title: 'Title of expansion panel',
  content: 'Lorem ipsum',
};
