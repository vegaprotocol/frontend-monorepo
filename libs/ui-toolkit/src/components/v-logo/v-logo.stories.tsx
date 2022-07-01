import type { Story, Meta } from '@storybook/react';
import { VLogo } from './v-logo';

export default {
  component: VLogo,
  title: 'V logo',
} as Meta;

const Template: Story = () => <VLogo />;

export const Default = Template.bind({});
