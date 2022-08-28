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
        <span className="text-neutral-700 dark:text-neutral-300">
          <SunIcon />
        </span>
      ) : (
        <span className="text-neutral-700 dark:text-neutral-300">
          <MoonIcon />
        </span>
      )}
    </button>
  );
};
