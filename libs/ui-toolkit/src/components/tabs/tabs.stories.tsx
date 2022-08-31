import type { Story, Meta } from '@storybook/react';
import type { ReactNode } from 'react';
import { Tabs, Tab } from './tabs';

export default {
  component: Tabs,
  title: 'Tabs',
} as Meta;

export const Default: Story = () => (
  <Tabs>
    <Tab id="one" name="Tab one">
      <Content>Tab one content</Content>
    </Tab>
    <Tab id="two" name="Tab two">
      <Content>Tab two content</Content>
    </Tab>
    <Tab id="three" name="Tab three">
      <Content>Tab three content</Content>
    </Tab>
  </Tabs>
);

const Content = ({ children }: { children: ReactNode }) => {
  return <div className="p-4">{children}</div>;
};
