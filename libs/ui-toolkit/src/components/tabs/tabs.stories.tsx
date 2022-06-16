import type { Story, Meta } from '@storybook/react';
import { Tabs, Tab } from './tabs';

export default {
  component: Tabs,
  title: 'Tabs',
} as Meta;

export const Default: Story = () => (
  <Tabs>
    <Tab id="one" name="Tab one">
      <p>Tab one content</p>
    </Tab>
    <Tab id="two" name="Tab two">
      <p>Tab two content</p>
    </Tab>
    <Tab id="three" name="Tab three">
      <p>Tab three content</p>
    </Tab>
  </Tabs>
);
