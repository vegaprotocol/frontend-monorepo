import classNames from 'classnames';
import React from 'react';
import { SunIcon, MoonIcon } from './icons';

export const ThemeSwitcher = ({
  theme,
  onToggle,
  className,
  sunClassName,
  moonClassName,
  fixedBg,
}: {
  theme: 'light' | 'dark';
  onToggle: () => void;
  className?: string;
  sunClassName?: string;
  moonClassName?: string;
  fixedBg?: 'light' | 'dark';
}) => {
  const sharedClasses = classNames('hover:text-white group-focus-visible:text-white', {
    'text-neutral-800 dark:text-neutral-300': !fixedBg,
    'text-neutral-800': fixedBg === 'light',
    'text-neutral-300': fixedBg === 'dark',
  });
  const sunClasses = classNames(sharedClasses, sunClassName, {
    hidden: theme === 'light',
  });
  const moonClasses = classNames(sharedClasses, moonClassName, {
    hidden: theme === 'dark',
  });
  return (
    <button
      type="button"
      onClick={() => onToggle()}
      className={classNames('group', className)}
      data-testid="theme-switcher"
    >
      <span className={sunClasses}>
        <SunIcon />
      </span>
      <span className={moonClasses}>
        <MoonIcon />
      </span>
    </button>
  );
};
