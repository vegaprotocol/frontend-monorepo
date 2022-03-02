import { Story, Meta } from '@storybook/react';
import { Button } from './button';

export default {
  component: Button,
  title: 'Button',
} as Meta;

const Template: Story = (args) => (
  <>
    <div className="mb-8">
      <Button {...args} />
    </div>
    {args['variant'] !== 'inline' && <Button {...args} disabled />}
  </>
);

export const Primary = Template.bind({});
Primary.args = {
  children: 'Primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  children: 'Secondary',
  variant: 'secondary',
};

export const Accent = Template.bind({});
Accent.args = {
  children: 'Accent',
  variant: 'accent',
};

export const Inline = Template.bind({});
Inline.args = {
  children: 'Inline',
  variant: 'inline',
};

export const IconPrepend = Template.bind({});
IconPrepend.args = {
  children: 'Icon prepend',
  prependIconName: 'search',
  variant: 'accent',
};

export const IconAppend = Template.bind({});
IconAppend.args = {
  children: 'Icon append',
  appendIconName: 'search',
  variant: 'accent',
};
