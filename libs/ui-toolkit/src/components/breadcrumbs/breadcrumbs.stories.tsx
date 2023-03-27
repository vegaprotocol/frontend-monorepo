import type { Story, ComponentMeta } from '@storybook/react';
import type { ComponentProps } from 'react';
import { Breadcrumbs } from './breadcrumbs';

export default {
  component: Breadcrumbs,
  title: 'Breadcrumbs',
} as ComponentMeta<typeof Breadcrumbs>;

const Template: Story = (args) => (
  <div className="mb-8">
    <Breadcrumbs {...(args as ComponentProps<typeof Breadcrumbs>)} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  elements: ['Home', 'Transactions', 'B540A…A68DB'],
};
