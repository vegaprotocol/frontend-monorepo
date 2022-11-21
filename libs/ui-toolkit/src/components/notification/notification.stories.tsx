import type { Meta, Story } from '@storybook/react';
import { Intent } from '../../utils/intent';
import { ExternalLink, Link } from '../link';
import { Notification } from './notification';

export default {
  component: Notification,
  title: 'Notification',
} as Meta;

const Template: Story = ({ intent, message, children }) => (
  <div className="flex">
    <Notification intent={intent} message={message}>
      {children}
    </Notification>
  </div>
);

const props = {
  message: 'Exercitationem doloremque neque laborum incidunt consectetur amet',
  children: (
    <div className="flex space-x-1">
      <Link>Action</Link>
      <ExternalLink>External action</ExternalLink>
    </div>
  ),
};

export const Default = Template.bind({});
Default.args = {
  ...props,
  intent: Intent.None,
};

export const Primary = Template.bind({});
Primary.args = {
  ...props,
  intent: Intent.Primary,
};

export const Success = Template.bind({});
Success.args = {
  ...props,
  intent: Intent.Success,
};

export const Warning = Template.bind({});
Warning.args = {
  ...props,
  intent: Intent.Warning,
};

export const Danger = Template.bind({});
Danger.args = {
  ...props,
  intent: Intent.Danger,
};
