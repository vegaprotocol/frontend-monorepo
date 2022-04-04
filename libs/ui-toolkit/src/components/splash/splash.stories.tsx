import type { Story, ComponentMeta } from '@storybook/react';
import type { SplashProps } from './splash';
import { Splash } from './splash';

export default {
  component: Splash,
  title: 'Splash',
} as ComponentMeta<typeof Splash>;

const Template: Story<SplashProps> = (args) => <Splash {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: <>Some center text to be used as splash screen content!</>,
};
