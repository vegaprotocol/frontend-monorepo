import type { Story, ComponentMeta } from '@storybook/react';
import { AnnouncementBanner } from './announcement-banner';

export default {
  component: AnnouncementBanner,
  title: 'Announcement Banner',
} as ComponentMeta<typeof AnnouncementBanner>;

const Template: Story = (args) => (
  <div className="mb-8">
    <AnnouncementBanner {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  children: <div className="text-center">Banner text</div>,
};
