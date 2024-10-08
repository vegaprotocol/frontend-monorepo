import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import type {
  SliderProps,
  SliderTrackProps,
  SliderRangeProps,
  SliderThumbProps,
} from '@radix-ui/react-slider';
import { cn } from '../../utils/cn';

export const SliderRoot = ({
  children,
  className,
  orientation = 'horizontal',
  ...props
}: SliderProps) => {
  const defaultStyles = 'relative flex items-center select-none touch-none';
  const classes = cn(
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
  const defaultStyles = 'bg-surface-2 relative grow h-[4px]';
  return (
    <SliderPrimitive.Track className={cn(defaultStyles, className)} {...props}>
      {children}
    </SliderPrimitive.Track>
  );
};

export const SliderRange = ({ className, ...props }: SliderRangeProps) => {
  const defaultStyles = 'absolute bg-surface-3  h-full';
  return (
    <SliderPrimitive.Range
      className={cn(defaultStyles, className)}
      {...props}
    />
  );
};

const tooltipClasses =
  'before:content-[attr(data-tooltip)] before:hidden hover:before:block before:absolute before:top-[-30px] before:left-[50%] before:-translate-x-1/2 before:bg-gs-100 before:border before:border-gs-200 before:px-2 before:py-1 before:z-20 before:rounded before:text-xs before:text-gs-0';

export const SliderThumb = ({
  className,
  tooltip,
  ...props
}: SliderThumbProps & { tooltip?: string }) => {
  const defaultStyles =
    'block w-[18px] h-[18px] border-[2px] rounded-full border-surface-0 bg-surface-0-fg focus-visible:outline-0';
  return (
    <SliderPrimitive.Thumb
      className={cn(defaultStyles, className, {
        [tooltipClasses]: tooltip,
      })}
      {...props}
      asChild
    >
      <span data-tooltip={tooltip} />
    </SliderPrimitive.Thumb>
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
