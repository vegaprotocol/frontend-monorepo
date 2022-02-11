import { Story, Meta } from '@storybook/react';
import { UiToolkit, UiToolkitProps } from './ui-toolkit';

export default {
  component: UiToolkit,
  title: 'UiToolkit',
} as Meta;

const Template: Story<UiToolkitProps> = (args) => <UiToolkit {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
