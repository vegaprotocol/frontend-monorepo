import { Story, ComponentMeta } from '@storybook/react';
import { SplashLoader, SplashLoaderProps } from './splash-loader';

export default {
  component: SplashLoader,
  title: 'SplashLoader',
} as ComponentMeta<typeof SplashLoader>;

const Template: Story<SplashLoaderProps> = (args) => <SplashLoader {...args} />;

export const Default = Template.bind({});
Default.args = {
  text: 'Some text',
};
