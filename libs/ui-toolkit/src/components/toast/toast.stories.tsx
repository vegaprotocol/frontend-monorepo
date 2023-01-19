/* eslint-disable jsx-a11y/accessible-emoji */
import { Toast } from './toast';
import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { Intent } from '../../utils/intent';

export default {
  title: 'Toast',
  component: Toast,
} as ComponentMeta<typeof Toast>;

const Template: ComponentStory<typeof Toast> = (args) => {
  const toastContent = (
    <>
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
      <p>Eaque exercitationem saepe cupiditate sunt impedit.</p>
      <p>I really like 🥪🥪🥪!</p>
    </>
  );
  return <Toast {...args} content={toastContent} />;
};

export const Default = Template.bind({});
Default.args = {
  id: 'def',
  intent: Intent.None,
  state: 'showing',
};

export const Primary = Template.bind({});
Primary.args = {
  id: 'pri',
  intent: Intent.Primary,
  state: 'showing',
};

export const Danger = Template.bind({});
Danger.args = {
  id: 'dan',
  intent: Intent.Danger,
  state: 'showing',
};

export const Warning = Template.bind({});
Warning.args = {
  id: 'war',
  intent: Intent.Warning,
  state: 'showing',
};

export const Success = Template.bind({});
Success.args = {
  id: 'suc',
  intent: Intent.Success,
  state: 'showing',
};
