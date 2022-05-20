import type { ComponentStory, ComponentMeta } from '@storybook/react';

import { ExplorerLink } from '.';

export default {
  title: 'ExplorerLink',
  component: ExplorerLink,
} as ComponentMeta<typeof ExplorerLink>;

const Template: ComponentStory<typeof ExplorerLink> = (args) => (
  <ExplorerLink {...args} />
);

export const Block = Template.bind({});
Block.args = {
  entity: 'block',
  id: '1234',
  children: 'View block in Explorer',
};

export const Party = Template.bind({});
Party.args = {
  entity: 'party',
  id: '123456789',
  children: 'View party in Explorer',
};
