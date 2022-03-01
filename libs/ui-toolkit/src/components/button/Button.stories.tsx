import { Story, Meta } from '@storybook/react';
import { Button } from './Button';

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
