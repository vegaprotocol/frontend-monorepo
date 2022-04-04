import type { Story, Meta } from '@storybook/react';
import type { CopyWithTooltipProps } from './copy-with-tooltip';
import { CopyWithTooltip } from './copy-with-tooltip';

export default {
  component: CopyWithTooltip,
  title: 'CopyWithTooltip',
} as Meta;

const Template: Story<CopyWithTooltipProps> = (args) => (
  <div>
    <p>
      <span>{args.text}</span>
      {' | '}
      <CopyWithTooltip {...args} />
    </p>
  </div>
);

export const Default = Template.bind({});
Default.args = {
  children: <button className="underline">Copy</button>,
  text: 'Lorem ipsum dolor sit',
};
