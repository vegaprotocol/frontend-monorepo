import React from 'react';
import classNames from 'classnames';
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
  const classes = 'text-neutral-800 dark:text-neutral-300 hover:text-white';

  return (
    <button
      type="button"
      onClick={() => onToggle()}
      className={classNames('group', className)}
      data-testid="theme-switcher"
    >
      {theme === 'dark' && (
        <span className={classes}>
          <SunIcon />
        </span>
      )}
      {theme === 'light' && (
        <span className={classes}>
          <MoonIcon />
        </span>
      )}
    </button>
  );
};
