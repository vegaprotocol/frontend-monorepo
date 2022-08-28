import React from 'react';
import classNames from 'classnames';
import { SunIcon, MoonIcon } from './icons';

export const ThemeSwitcher = ({
  theme,
  onToggle,
  className,
  sunClassName = '',
  moonClassName = '',
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
        <span className="text-white">
          <SunIcon />
        </span>
      ) : (
        <span className="text-white">
          <MoonIcon />
        </span>
      )}
    </button>
  );
};
