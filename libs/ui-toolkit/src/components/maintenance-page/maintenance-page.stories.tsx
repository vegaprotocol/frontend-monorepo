import type { Story, Meta } from '@storybook/react';
import { MaintenancePage } from './maintenance-page';

export default {
  component: MaintenancePage,
  title: 'Maintenance Page',
} as Meta;

const Template: Story = (args) => <MaintenancePage />;

export const Default = Template.bind({});
