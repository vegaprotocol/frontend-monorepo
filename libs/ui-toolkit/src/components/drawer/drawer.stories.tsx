import React, { useState } from 'react';
import type { ComponentMeta } from '@storybook/react';
import type { Story } from '@storybook/react';
import {
  NavigationDrawer,
  NavigationDrawerMenu,
  DrawerToggle,
  DrawerWrapper,
  DrawerContainer,
  DRAWER_TOGGLE_VARIANTS,
} from './';

export default {
  component: NavigationDrawer,
  title: 'Drawer',
} as ComponentMeta<typeof NavigationDrawer>;

const MENU_LINKS = [
  {
    label: 'Menu 1',
    component: <div className="w-full h-96 bg-red" />,
  },
  {
    label: 'Menu 2',
    component: <div className="w-full h-96 bg-yellow" />,
  },
  {
    label: 'Menu 3',
    component: <div className="w-full h-96 bg-blue" />,
  },
];

const Drawer: Story = () => {
  const [active, setActive] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const onToggle = () => setIsMenuOpen(!isMenuOpen);
  const menuItems = MENU_LINKS.map((link, index) => {
    return {
      ...link,
      onClick: () => {
        setActive(index);
        setIsMenuOpen(false);
      },
      active: index === active,
    };
  });

  const menu = (
    <div>
      <NavigationDrawerMenu menuItems={menuItems} />
      <p className="mt-16">
        This drawer has it's position fixed. It's themeable, but because it's
        fixed you cannot see the second drawer that is rendered behind this one
        on desktop.
      </p>
    </div>
  );

  return (
    <DrawerWrapper>
      <NavigationDrawer isMenuOpen={isMenuOpen} onToggle={onToggle}>
        <DrawerToggle
          onToggle={onToggle}
          variant={DRAWER_TOGGLE_VARIANTS.CLOSE}
        />
        {menu}
      </NavigationDrawer>
      <DrawerContainer>
        <DrawerToggle
          onToggle={onToggle}
          variant={DRAWER_TOGGLE_VARIANTS.OPEN}
        />
        {menuItems[active].component}
      </DrawerContainer>
    </DrawerWrapper>
  );
};

export const Default = Drawer.bind({});
Default.args = {};
