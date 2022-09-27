import type { ComponentStory, ComponentMeta } from '@storybook/react';

import { ExternalLink } from '.';
import { VegaLogo } from '../vega-logo';

export default {
  title: 'Link',
  component: ExternalLink,
} as ComponentMeta<typeof ExternalLink>;

const Template: ComponentStory<typeof ExternalLink> = (args) => (
  <ExternalLink {...args} />
);

export const Text = Template.bind({});
Text.args = {
  title: 'Link title',
  href: '/',
  children: 'View link',
};

export const Element = Template.bind({});
Element.args = {
  title: 'Link title',
  href: '/',
  children: <VegaLogo />,
};
