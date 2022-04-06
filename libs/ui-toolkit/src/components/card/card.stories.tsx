import React from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';

import { Card } from './card';

export default {
  title: 'Card',
  component: Card,
} as ComponentMeta<typeof Card>;

const Template: ComponentStory<typeof Card> = (args) => {
  return <Card>Test</Card>;
};

export const Default = Template.bind({});
Default.args = {};
