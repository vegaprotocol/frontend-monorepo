import type { Story, Meta } from '@storybook/react';
import { AccordionPanel } from './accordion';

export default {
  component: AccordionPanel,
  title: 'Accordion',
} as Meta;

const Template: Story = (args) => (
  <AccordionPanel title={args.title} content={args.content} />
);

export const Default = Template.bind({});
Default.args = {
  title: 'Title of expansion panel',
  content: 'Lorem ipsum',
};
