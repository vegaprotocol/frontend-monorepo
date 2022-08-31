import React from 'react';
import { Icon } from '../icons';

interface NavItemProps {
  iconName: string;
  label?: string;
}

export const NavItem = ({ iconName, label }: NavItemProps) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-start cursor-pointer relative">
      <Icon name={iconName} className="mr-2" />
      <span className="text-lg">{label}</span>
    </div>
  );
};
