import type { Story, Meta } from '@storybook/react';
import { ThemeSwitcher } from './theme-switcher';

export default {
  component: ThemeSwitcher,
  title: 'ThemeSwitcher',
} as Meta;

const Template: Story = (args) => (
  <ThemeSwitcher onToggle={() => document.body.classList.toggle('dark')} />
);

export const Default = Template.bind({});
Default.args = {};
