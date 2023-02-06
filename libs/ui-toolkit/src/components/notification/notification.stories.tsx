import type { Meta } from '@storybook/react';
import { Intent } from '../../utils/intent';
import { Link } from '../link';
import { Notification } from './notification';
import type { ComponentStory } from '@storybook/react';

export default {
  component: Notification,
  title: 'Notification',
} as Meta;

const Template: ComponentStory<typeof Notification> = (props) => (
  <div className="max-w-[410px]">
    <Notification {...props} />
  </div>
);

const props = {
  message: (
    <>
      This is a default message with an{' '}
      <Link href="/?path=/story/notification--default">optional link</Link> that
      returns onto multiple lines.
    </>
  ),
  title: 'Optional title',
  buttonProps: {
    text: 'Optional button',
    action: () => alert('Optional button action'),
  },
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
  message: (
    <>
      This is a info message with an{' '}
      <Link href="/?path=/story/notification--primary">optional link</Link> that
      returns onto multiple lines.
    </>
  ),
};

export const Success = Template.bind({});
Success.args = {
  ...props,
  intent: Intent.Success,
  message: (
    <>
      This is a success message with an{' '}
      <Link href="/?path=/story/notification--success">optional link</Link> that
      returns onto multiple lines.
    </>
  ),
};

export const Warning = Template.bind({});
Warning.args = {
  ...props,
  intent: Intent.Warning,
  message: (
    <>
      This is a warning message with an{' '}
      <Link href="/?path=/story/notification--warning">optional link</Link> that
      returns onto multiple lines.
    </>
  ),
};

export const Danger = Template.bind({});
Danger.args = {
  ...props,
  intent: Intent.Danger,
  message: (
    <>
      This is an error message with an{' '}
      <Link href="/?path=/story/notification--danger">optional link</Link> that
      returns onto multiple lines.
    </>
  ),
};
