import type { Story, Meta } from '@storybook/react';
import { AnchorButton, Button, ButtonLink } from './button';

export default {
  component: Button,
  title: 'Button',
} as Meta;

const Template: Story = (args) => (
  <div className="mb-8">
    <Button {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  children: 'Button text',
};

export const Primary = Template.bind({});
Primary.args = {
  children: 'Button text',
  variant: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  children: 'Button text',
  variant: 'secondary',
};

export const Disabled = Template.bind({});
Disabled.args = {
  children: 'Button text',
  disabled: true,
};

export const FullWidth = Template.bind({});
FullWidth.args = {
  children: 'Button text',
  fill: true,
};

export const Small = Template.bind({});
Small.args = {
  children: 'Button text',
  size: 'sm',
};

export const Medium = Template.bind({});
Medium.args = {
  children: 'Button text',
  size: 'md',
};

export const Anchor = () => {
  const props = {
    children: 'Go to google',
    href: 'https://google.com',
    target: '_blank',
  };
  return (
    <div className="mb-8">
      <AnchorButton {...props} />
    </div>
  );
};

export const ButtonLinkStory = () => {
  return (
    <div className="mb-8">
      <ButtonLink>Link like button</ButtonLink>
    </div>
  );
};
// export const Secondary = Template.bind({});
// Secondary.args = {
//   children: 'Secondary',
//   variant: 'secondary',
// };

// export const Trade = Template.bind({});
// Trade.args = {
//   children: 'Trade',
//   variant: 'trade',
// };

// export const Accent = Template.bind({});
// Accent.args = {
//   children: 'Accent',
//   variant: 'accent',
// };

// export const InlineLink = Template.bind({});
// InlineLink.args = {
//   children: 'Inline link',
//   variant: 'inline-link',
// };

// export const NavAccent: Story = () => (
//   <>
//     <div className="mb-8">
//       <Button variant="accent" className="px-4">
//         Background
//       </Button>
//     </div>
//     <div className="mb-8">
//       <Button variant="accent" className="px-4" prependIconName="menu-open">
//         Background
//       </Button>
//     </div>
//     <div className="mb-8">
//       <Button variant="accent" className="px-4" appendIconName="menu-closed">
//         Background
//       </Button>
//     </div>
//   </>
// );

// export const NavInline: Story = () => (
//   <>
//     <div className="mb-8">
//       <Button variant="inline-link" className="uppercase">
//         Background
//       </Button>
//     </div>
//     <div className="mb-8">
//       <Button
//         variant="inline-link"
//         className="uppercase"
//         prependIconName="menu-open"
//       >
//         Background
//       </Button>
//     </div>
//     <div className="mb-8">
//       <Button
//         variant="inline-link"
//         className="uppercase"
//         appendIconName="menu-closed"
//       >
//         Background
//       </Button>
//     </div>
//   </>
// );

export const IconPrepend = Template.bind({});
IconPrepend.args = {
  children: 'Icon prepend',
  icon: 'search',
  variant: 'primary',
};

export const IconAppend = Template.bind({});
IconAppend.args = {
  children: 'Icon append',
  rightIcon: 'search',
  variant: 'secondary',
};

// export const InlineIconPrepend = Template.bind({});
// InlineIconPrepend.args = {
//   children: 'Icon prepend',
//   prependIconName: 'search',
//   variant: 'inline-link',
// };

// export const InlineIconAppend = Template.bind({});
// InlineIconAppend.args = {
//   children: 'Icon append',
//   appendIconName: 'search',
//   variant: 'inline-link',
// };

// export const SpanWithButtonStyleAndContent = Template.bind({});
// SpanWithButtonStyleAndContent.args = {
//   children: 'Apply button styles to other elements (i.e. span, <Link>)',
//   appendIconName: 'search',
//   variant: 'trade',
// };
