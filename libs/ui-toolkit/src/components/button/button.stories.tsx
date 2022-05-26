import type { Story, Meta } from '@storybook/react';
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
    {args['variant'] !== 'inline-link' && <Button {...args} disabled />}
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

export const Trade = Template.bind({});
Trade.args = {
  children: 'Trade',
  variant: 'trade',
};

export const Accent = Template.bind({});
Accent.args = {
  children: 'Accent',
  variant: 'accent',
};

export const InlineLink = Template.bind({});
InlineLink.args = {
  children: 'Inline link',
  variant: 'inline-link',
};

export const NavAccent: Story = () => (
  <>
    <div className="mb-8">
      <Button variant="accent" className="px-4">
        Background
      </Button>
    </div>
    <div className="mb-8">
      <Button variant="accent" className="px-4" prependIconName="menu-open">
        Background
      </Button>
    </div>
    <div className="mb-8">
      <Button variant="accent" className="px-4" appendIconName="menu-closed">
        Background
      </Button>
    </div>
  </>
);

export const NavInline: Story = () => (
  <>
    <div className="mb-8">
      <Button variant="inline-link" className="uppercase">
        Background
      </Button>
    </div>
    <div className="mb-8">
      <Button
        variant="inline-link"
        className="uppercase"
        prependIconName="menu-open"
      >
        Background
      </Button>
    </div>
    <div className="mb-8">
      <Button
        variant="inline-link"
        className="uppercase"
        appendIconName="menu-closed"
      >
        Background
      </Button>
    </div>
  </>
);

export const IconPrepend = Template.bind({});
IconPrepend.args = {
  children: 'Icon prepend',
  prependIconName: 'search',
  variant: 'trade',
};

export const IconAppend = Template.bind({});
IconAppend.args = {
  children: 'Icon append',
  appendIconName: 'search',
  variant: 'trade',
};

export const InlineIconPrepend = Template.bind({});
InlineIconPrepend.args = {
  children: 'Icon prepend',
  prependIconName: 'search',
  variant: 'inline-link',
};

export const InlineIconAppend = Template.bind({});
InlineIconAppend.args = {
  children: 'Icon append',
  appendIconName: 'search',
  variant: 'inline-link',
};
