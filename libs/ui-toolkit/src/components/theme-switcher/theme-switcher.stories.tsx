import type { Story, Meta } from '@storybook/react';
import { useState } from 'react';
import { ThemeSwitcher } from './theme-switcher';

export default {
  component: ThemeSwitcher,
  title: 'ThemeSwitcher',
} as Meta;

const Template: Story = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return (
    <div className="p-4">
      <ThemeSwitcher
        theme={theme}
        onToggle={() => {
          setTheme((curr) => (curr === 'light' ? 'dark' : 'light'));
          document.body.classList.toggle('dark');
        }}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};
