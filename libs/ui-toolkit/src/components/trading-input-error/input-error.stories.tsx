import type { StoryFn, Meta } from '@storybook/react';
import { TradingInputError } from './input-error';

export default {
  component: TradingInputError,
  title: 'InputError trading',
} as Meta;

const Template: StoryFn = (args) => <TradingInputError {...args} />;

export const Danger = Template.bind({});
Danger.args = {
  children: 'An error that might have happened',
};

export const Warning = Template.bind({});
Warning.args = {
  intent: 'warning',
  children: 'Something that might be an issue',
};
