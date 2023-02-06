/* eslint-disable jsx-a11y/accessible-emoji */
import { Panel, Toast, ToastHeading } from './toast';
import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { Intent } from '../../utils/intent';
import { ExternalLink } from '../link';
import { ProgressBar } from '../progress-bar';

export default {
  title: 'Toast',
  component: Toast,
} as ComponentMeta<typeof Toast>;

const Template: ComponentStory<typeof Toast> = (args) => {
  return <Toast {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  id: 'def',
  intent: Intent.None,
  state: 'showing',
  content: (
    <>
      <ToastHeading>Optional heading</ToastHeading>
      <p>This is a message that can return over multiple lines.</p>
      <p>
        <ExternalLink>Optional link</ExternalLink>
      </p>
    </>
  ),
  onClose: () => undefined,
};

export const Primary = Template.bind({});
Primary.args = {
  id: 'pri',
  intent: Intent.Primary,
  state: 'showing',
  content: (
    <>
      <ToastHeading>Optional heading</ToastHeading>
      <p>This is a message that can return over multiple lines.</p>
      <p>
        <ExternalLink>Optional link</ExternalLink>
      </p>
      <Panel>Lorem ipsum dolor sit amet consectetur adipisicing elit</Panel>
    </>
  ),
  onClose: () => undefined,
};

export const Danger = Template.bind({});
Danger.args = {
  id: 'dan',
  intent: Intent.Danger,
  state: 'showing',
  content: (
    <>
      <ToastHeading>Optional heading</ToastHeading>
      <p>This is a message that can return over multiple lines.</p>
      <p>
        <ExternalLink>Optional link</ExternalLink>
      </p>
      <Panel>Lorem ipsum dolor sit amet consectetur adipisicing elit</Panel>
    </>
  ),
  onClose: () => undefined,
};

export const Warning = Template.bind({});
Warning.args = {
  id: 'war',
  intent: Intent.Warning,
  state: 'showing',
  content: (
    <>
      <ToastHeading>Optional heading</ToastHeading>
      <p>This is a message that can return over multiple lines.</p>
      <p>
        <ExternalLink>Optional link</ExternalLink>
      </p>
      <Panel>
        <strong>Deposit 10.00 tUSDX</strong>
        <p className="mt-[2px]">Awaiting confirmations (1/3)</p>
        <ProgressBar value={33.33} />
      </Panel>
    </>
  ),
  onClose: () => undefined,
};

export const Success = Template.bind({});
Success.args = {
  id: 'suc',
  intent: Intent.Success,
  state: 'showing',
  content: (
    <>
      <ToastHeading>Optional heading</ToastHeading>
      <p>This is a message that can return over multiple lines.</p>
      <p>
        <ExternalLink>Optional link</ExternalLink>
      </p>
      <Panel>Lorem ipsum dolor sit amet consectetur adipisicing elit</Panel>
    </>
  ),
  onClose: () => undefined,
};
