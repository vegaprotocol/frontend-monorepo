import { Thumbs } from './thumbs';
import type { ThumbsProps } from './thumbs';
import type { Meta, Story } from '@storybook/react';

export default {
  component: Thumbs,
  title: 'Thumbs',
} as Meta;

const Template: Story<ThumbsProps> = (args) => <Thumbs {...args} />;

export const Up = Template.bind({});
Up.args = {
  up: true,
};

export const Down = Template.bind({});
Down.args = {
  up: false,
};

export const WithText = Template.bind({});
WithText.args = {
  up: true,
  text: 'description text',
};
