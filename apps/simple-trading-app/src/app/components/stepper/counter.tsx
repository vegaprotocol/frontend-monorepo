import * as React from 'react';
import classNames from 'classnames';
import Video from '../header/video';

interface CounterProps {
  label: string;
  className?: string;
  isActive: boolean;
}

type TStyleMap = {
  [key: string]: string;
};

const reduceStyles = (styleMap: TStyleMap) =>
  Object.keys(styleMap).reduce((acc, curr) => acc + `${styleMap[curr]} `, '');

export const Counter = ({ label, isActive, className }: CounterProps) => {
  const generalStyles: TStyleMap = {
    shape: 'rounded-full relative aspect-square clip-path-rounded',
    border: 'border-black dark:border-white',
    colours: 'bg-white dark:bg-black text-black dark:text-white',
    children: 'flex items-center justify-center text-center',
  };

  const unselected: TStyleMap = {
    border: 'border',
    size: 'w-[30px] md:w-40',
    margin: 'mt-[5px] md:ml-[10px] md:mt-0',
  };

  const selected: TStyleMap = {
    colours: 'text-xl text-white',
    size: 'w-40 md:w-[60px]',
  };

  const classes = classNames(
    reduceStyles(generalStyles),
    isActive ? reduceStyles(selected) : reduceStyles(unselected),
    className
  ).replace(/  +/g, ' '); // remove double space

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
