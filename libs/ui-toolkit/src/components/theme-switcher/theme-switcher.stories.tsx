import type { Story, Meta } from '@storybook/react';
import { ThemeSwitcher } from './theme-switcher';

export default {
  component: ThemeSwitcher,
  title: 'ThemeSwitcher',
} as Meta;

const Template: Story = () => {
  return (
    <div className="p-4">
      <ThemeSwitcher />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};
