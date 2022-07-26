import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import type {
  SliderProps,
  SliderTrackProps,
  SliderRangeProps,
  SliderThumbProps,
} from '@radix-ui/react-slider';
import classNames from 'classnames';

export const SliderRoot = ({
  children,
  className,
  orientation = 'horizontal',
  ...props
}: SliderProps) => {
  const defaultStyles = 'relative flex items-center select-none touch-none';
  const classes = classNames(
    defaultStyles,
    {
      'h-[20px] w-full': orientation === 'horizontal',
      'flex-col w-[20px] h-full': orientation === 'vertical',
    },
    className
  );

  return (
    <SliderPrimitive.Root
      orientation={orientation}
      className={classes}
      {...props}
    >
      {children}
    </SliderPrimitive.Root>
  );
};

export const SliderTrack = ({
  children,
  className,
  ...props
}: SliderTrackProps) => {
  const defaultStyles = 'bg-black dark:bg-white relative grow h-[3px]';
  return (
    <SliderPrimitive.Track
      className={classNames(defaultStyles, className)}
      {...props}
    >
      {children}
    </SliderPrimitive.Track>
  );
};

export const SliderRange = ({ className, ...props }: SliderRangeProps) => {
  const defaultStyles = 'absolute bg-blue h-full';
  return (
    <SliderPrimitive.Range
      className={classNames(defaultStyles, className)}
      {...props}
    />
  );
};

export const SliderThumb = ({ className, ...props }: SliderThumbProps) => {
  const defaultStyles =
    'block w-[20px] h-[20px] border-2 border-black dark:border-white bg-white dark:bg-black rounded-full';
  return (
    <SliderPrimitive.Thumb
      className={classNames(defaultStyles, className)}
      {...props}
    />
  );
};

export const Slider = (props: SliderProps) => {
  return (
    <SliderRoot {...props}>
      <SliderTrack>
        <SliderRange />
      </SliderTrack>
      <SliderThumb />
    </SliderRoot>
  );
};
