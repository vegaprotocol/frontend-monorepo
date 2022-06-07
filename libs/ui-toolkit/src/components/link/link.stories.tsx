import type { ComponentStory, ComponentMeta } from '@storybook/react';

import { Link } from '.';
import { VegaLogo } from '../vega-logo';

export default {
  title: 'Link',
  component: Link,
} as ComponentMeta<typeof Link>;

const Template: ComponentStory<typeof Link> = (args) => <Link {...args} />;

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
