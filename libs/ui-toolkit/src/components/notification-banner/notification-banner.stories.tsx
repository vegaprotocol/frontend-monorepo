/* eslint-disable jsx-a11y/accessible-emoji */
import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { Intent } from '../../utils/intent';
import { NotificationBanner } from './notification-banner';
import { Button } from '../button';

export default {
  title: 'NotificationBanner',
  component: NotificationBanner,
} as ComponentMeta<typeof NotificationBanner>;

const Template: ComponentStory<typeof NotificationBanner> = (args) => {
  return (
    <div className="flex flex-col gap-4">
      <NotificationBanner
        intent={Intent.Warning}
        onClose={() => {
          return;
        }}
      >
        <div className="uppercase ">
          The network will upgrade to v0.68.5 in{' '}
          <span className="text-orange-500">9234</span> blocks
        </div>
        <div>
          Trading activity will be interrupted, manage your risk appropriately.
          <a href="/">View details</a>
        </div>
      </NotificationBanner>
      <NotificationBanner intent={Intent.Danger}>
        The oracle for this market has been flagged as malicious by the
        community.
      </NotificationBanner>
      <NotificationBanner>
        Viewing as Vega user 0592X...20CKZ
        <Button size="sm" className="ml-2">
          Exit view as
        </Button>
      </NotificationBanner>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};
