import { useEffect, useRef } from 'react';
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
  const sun = useRef<HTMLSpanElement>(null);
  const moon = useRef<HTMLSpanElement>(null);
  const classes = 'text-neutral-800 dark:text-neutral-300 hidden';
  useEffect(() => {
    if (!theme || !sun.current || !moon.current) return;
    switch (theme) {
      case 'dark':
        moon.current.classList.add('hidden');
        sun.current.classList.remove('hidden');
        break;
      case 'light':
        moon.current.classList.remove('hidden');
        sun.current.classList.add('hidden');
        break;
    }
  }, [sun, moon, theme]);
  return (
    <button
      type="button"
      onClick={() => onToggle()}
      className={className}
      data-testid="theme-switcher"
    >
      <span ref={sun} className={classes}>
        <SunIcon />
      </span>
      <span ref={moon} className={classes}>
        <MoonIcon />
      </span>
    </button>
  );
};
