import classNames from 'classnames';
import { SunIcon, MoonIcon } from './icons';

export const ThemeSwitcher = ({
  onToggle,
  className,
  sunClassName = '',
  moonClassName = '',
}: {
  onToggle: () => void;
  className?: string;
  sunClassName?: string;
  moonClassName?: string;
}) => {
  const sunClasses = classNames('dark:hidden text-black', {
    [sunClassName]: sunClassName,
  });
  const moonClasses = classNames('hidden dark:inline text-white', {
    [moonClassName]: moonClassName,
  });

  return (
    <button type="button" onClick={() => onToggle()} className={className}>
      <span className={sunClasses}>
        <SunIcon />
      </span>
      <span className={moonClasses}>
        <MoonIcon />
      </span>
    </button>
  );
};
