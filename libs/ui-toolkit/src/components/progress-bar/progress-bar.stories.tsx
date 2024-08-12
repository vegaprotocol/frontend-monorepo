import type { Story, Meta } from '@storybook/react';
import { ProgressBar } from './progress-bar';
import { Intent } from '../../utils/intent';

export default {
  component: ProgressBar,
  title: 'ProgressBar',
  storySort: {
    order: ['Default', 'None', 'Primary', 'Danger', 'Warning', 'Success'],
  },
  argTypes: {
    intent: {
      options: Object.values(Intent).filter((x) => typeof x === 'string'),
      mapping: Intent,
      control: {
        type: 'radio',
      },
    },
  },
} as Meta;

const Template: Story = (args) => <ProgressBar {...args} />;

export const Default = Template.bind({});
Default.args = {
  value: 10,
};

export const None = Template.bind({});
None.args = {
  intent: 'None',
  value: 10,
};

export const Primary = Template.bind({});
Primary.args = {
  intent: 'Primary',
  value: 10,
};

export const Success = Template.bind({});
Success.args = {
  intent: 'Success',
  value: 30,
};

export const Warning = Template.bind({});
Warning.args = {
  intent: 'Warning',
  value: 40,
};

export const Danger = Template.bind({});
Danger.args = {
  intent: 'Danger',
  value: 50,
};
