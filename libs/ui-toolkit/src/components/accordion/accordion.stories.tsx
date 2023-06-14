import type { Story, Meta } from '@storybook/react';
import { Accordion, AccordionItem } from './accordion';

export default {
  component: Accordion,
  title: 'Accordion',
} as Meta;

const Template: Story = (args) => <Accordion panels={args.panels} />;

export const Default = Template.bind({});
Default.args = {
  children: [
    <AccordionItem
      itemId="1"
      title={'Title of expansion panel'}
      content={'Lorem ipsum'}
    />,
    <AccordionItem
      itemId="2"
      title={'Title of expansion panel'}
      content={'Lorem ipsum'}
    />,
    <AccordionItem
      itemId="3"
      title={'Title of expansion panel'}
      content={'Lorem ipsum'}
    />,
  ],
};
