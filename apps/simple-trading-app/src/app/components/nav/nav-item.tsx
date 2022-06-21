import React from 'react';
import { Icon } from '../icons';

interface NavItemProps {
  iconName: string;
  label?: string;
}

export const NavItem = ({ iconName, label }: NavItemProps) => {
  return (
    <div className="flex items-center justify-start cursor-pointer relative">
      <Icon name={iconName} className="mr-8" />
      <span>{label}</span>
    </div>
  );
};
