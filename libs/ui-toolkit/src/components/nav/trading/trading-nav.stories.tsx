import type { Story, Meta } from '@storybook/react';
import { Navbar } from './trading-nav';

export default {
  component: Navbar,
  title: 'Trading nav',
} as Meta;

const menuItems = [
  { name: 'Trading', path: '/foo', isActive: false },
  { name: 'Portfolio', path: '/bar', isActive: false },
  { name: 'Network', path: '/baz', isActive: false },
];

const Template: Story = (args) => <Navbar {...args} />;

export const Default = Template.bind({});
Default.args = {
  navItems: [...menuItems],
  menuName: 'default',
  menuId: 'def',
  showHomeLogo: true,
};

export const WithActive = Template.bind({});
WithActive.args = {
  navItems: [
    { name: 'Trading', path: '/asdf', isActive: true },
    { name: 'Network', path: '/dfgf', isActive: false },
  ],
  menuName: 'default',
  menuId: 'def',
  showHomeLogo: true,
};

export const WithOnClick = Template.bind({});
WithOnClick.args = {
  navItems: [
    {
      name: 'OnClick1',
      path: '/blah',
      isActive: false,
      onClick: (e: { preventDefault: () => void }) => {
        e.preventDefault();
        alert('OnClick1!');
      },
    },
    {
      name: 'OnClick2',
      path: '/foo',
      isActive: false,
      onClick: (e: { preventDefault: () => void }) => {
        e.preventDefault();
        alert('OnClick2');
      },
    },
  ],
  menuName: 'withOnClicks',
  menuId: 'oc',
  showHomeLogo: true,
};

export const NoLogo = Template.bind({});
NoLogo.args = {
  navItems: [...menuItems],
  menuName: 'noLogo',
  menuId: 'nl',
  showHomeLogo: false,
};

export const Fairground = Template.bind({});
Fairground.args = {
  navItems: [...menuItems],
  menuName: 'fairground',
  menuId: 'fg',
  showHomeLogo: true,
  fairground: true,
};
