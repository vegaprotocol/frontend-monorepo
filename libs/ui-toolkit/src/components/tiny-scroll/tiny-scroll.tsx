import cn from 'classnames';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { type ComponentPropsWithoutRef } from 'react';

export const TinyScroll = ({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof ScrollArea.Root>) => (
  <ScrollArea.Root
    className={cn(
      'ScrollAreaRoot w-full h-full relative overflow-hidden',
      className
    )}
    {...props}
  >
    <ScrollArea.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollArea.Viewport>
    <TinyScrollBar />
    <ScrollArea.Corner />
  </ScrollArea.Root>
);

const TinyScrollBar = ({
  className,
  orientation = 'vertical',
  ...props
}: ComponentPropsWithoutRef<typeof ScrollArea.ScrollAreaScrollbar>) => (
  <ScrollArea.ScrollAreaScrollbar
    orientation={orientation}
    className={cn(
      'bg-vega-clight-500 hover:bg-vega-clight-400',
      'dark:bg-vega-cdark-500 dark:hover:bg-vega-cdark-400',
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' && 'h-full w-1',
      orientation === 'horizontal' && 'h-1 flex-col',
      className
    )}
    {...props}
  >
    <ScrollArea.ScrollAreaThumb className="relative flex-1 bg-vega-clight-300 dark:bg-vega-cdark-300" />
  </ScrollArea.ScrollAreaScrollbar>
);
