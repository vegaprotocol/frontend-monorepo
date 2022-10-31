import React from 'react';
import { SunIcon, MoonIcon } from './icons';

export const ThemeSwitcher = ({
  theme,
  onToggle,
  className,
}: {
  theme: 'light' | 'dark';
  onToggle: () => void;
  className?: string;
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={className}
      data-testid="theme-switcher"
    >
      {theme === 'dark' && <SunIcon />}
      {theme === 'light' && <MoonIcon />}
    </button>
  );
};
