import fetchMock from 'fetch-mock';
import { addSeconds } from 'date-fns';
import type { Story, Meta } from '@storybook/react';
import { AnnouncementBanner } from './announcements';

export default {
  component: AnnouncementBanner,
  title: 'AnnouncementBanner',
} as Meta;

const a = addSeconds(new Date(), 30);

const MOCK_URL = 'http://somewhere.com/config.json';
fetchMock.get(MOCK_URL, {
  console: [
    {
      text: 'Console announcement',
      url: 'http://vega.xyz',
      urlText: 'Read more',
      timing: {
        to: a.toISOString(),
      },
    },
  ],
  governance: [
    {
      text: 'Governance announcement',
      url: 'http://vega.xyz',
      urlText: 'Read more',
    },
  ],
  explorer: [
    {
      text: 'Explorer announcement',
      url: 'http://vega.xyz',
      urlText: 'Read more',
    },
  ],
  wallet: [
    {
      text: 'Wallet announcement',
      url: 'http://vega.xyz',
      urlText: 'Read more',
    },
  ],
  website: [
    {
      text: 'Website announcement',
      url: 'http://vega.xyz',
      urlText: 'Read more',
    },
  ],
});

const Template: Story = (args) => (
  <AnnouncementBanner app={args.app} configUrl={args.configUrl} />
);

export const Default = Template.bind({});
Default.args = {
  configUrl: MOCK_URL,
  app: 'console',
};
