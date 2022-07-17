import * as React from 'react';
import classNames from 'classnames';
import Video from '../header/video';

interface CounterProps {
  label: string;
  className?: string;
  isActive: boolean;
}

export const Counter = ({ label, isActive, className }: CounterProps) => {
  const classes = classNames(
    'rounded-full relative border-black dark:border-white bg-white dark:bg-black text-black dark:text-white aspect-square clip-path-rounded flex items-center justify-center text-center',
    {
      border: !isActive,
      'mt-[5px] md:ml-[10px] md:mt-0': !isActive,
      'w-[30px] md:w-40': !isActive,
      'w-40 md:w-[60px]': isActive,
      'text-xl text-white': isActive,
    },
    className
  );
  return (
    <div className={classes} aria-hidden>
      {isActive && (
        <div className="w-full h-full">
          <Video />
        </div>
      )}
      <span className="absolute inset-0 flex items-center	justify-center">
        {label}
      </span>
    </div>
  );
};
