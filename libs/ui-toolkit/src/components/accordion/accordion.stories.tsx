import type { Story, Meta } from '@storybook/react';
import { AccordionPanel } from './accordion';

export default {
  component: AccordionPanel,
  title: 'Accordion',
} as Meta;

const Template: Story = (args) => (
  <>
    <AccordionPanel title={args.title} content={args.content} key={'1'} />
    <AccordionPanel title={args.title} content={args.content} key={'2'} />
    <AccordionPanel title={args.title} content={args.content} key={'3'} />
  </>
);

export const Default = Template.bind({});
Default.args = {
  title: 'Title of expansion panel',
  content: 'Lorem ipsum',
};
