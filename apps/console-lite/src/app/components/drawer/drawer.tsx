import * as React from 'react';
import classNames from 'classnames';
import type { ReactElement } from 'react';

interface Props {
  children?: ReactElement | ReactElement[];
  isMenuOpen?: boolean;
  onToggle(): void;
  rtl?: boolean;
  outerClasses?: string;
  innerClasses?: string;
}

export const NavigationDrawer = ({
  isMenuOpen = false,
  onToggle,
  children,
  rtl,
  outerClasses = '',
  innerClasses = '',
}: Props) => {
  const width = 'w-full md:w-auto md:min-w-[15%] shrink-0';
  const position = 'absolute inset-0 h-full z-10 md:static';
  const background = 'bg-black/50 dark:bg-white/50';
  const flex = 'flex justify-end overflow-hidden';
  const joinedClasses = [flex, width, position, background].join(' ');

  const outerStyles = classNames(joinedClasses, {
    visible: isMenuOpen,
    'invisible md:visible': !isMenuOpen,
    'flex-row-reverse': !rtl,
    [outerClasses]: outerClasses,
  });

  const translateClose = rtl ? 'translate-x-full' : '-translate-x-full';

  const innerStyles = classNames(
    'w-3/4 md:w-full bg-white dark:bg-lite-black',
    {
      'translate-x-0 transition-transform md:transform-none': isMenuOpen,
      [`${translateClose} md:transform-none`]: !isMenuOpen,
      [innerClasses]: innerClasses,
    }
  );

  return (
    <aside aria-label="Sidebar Navigation Menu" className={outerStyles}>
      <div
        role="presentation"
        aria-label="Content Overlay - Click To Close Sidebar Navigation"
        className="md:hidden grow h-full"
        onClick={onToggle}
      />
      <div
        role="group"
        aria-label="Sidebar Navigation Grouped Content"
        className={innerStyles}
      >
        {children}
      </div>
    </aside>
  );
};
