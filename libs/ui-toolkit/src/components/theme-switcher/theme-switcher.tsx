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
  sunClassName?: string;
  moonClassName?: string;
}) => {
  return (
    <button
      type="button"
      onClick={() => onToggle()}
      className={className}
      data-testid="theme-switcher"
    >
      {theme === 'dark' ? (
        <span className="text-neutral-300">
          <SunIcon />
        </span>
      ) : (
        <span className="text-neutral-900">
          <MoonIcon />
        </span>
      )}
    </button>
  );
};
