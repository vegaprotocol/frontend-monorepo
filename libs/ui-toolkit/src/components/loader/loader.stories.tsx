import type { Story, Meta } from '@storybook/react';
import type { LoaderProps } from './loader';
import { Loader } from './loader';

export default {
  component: Loader,
  title: 'Loader',
} as Meta;

const Template: Story<LoaderProps> = (args) => <Loader />;

export const Large = Template.bind({});

export const Small = Template.bind({});
Small.args = {
  size: 'small',
};
