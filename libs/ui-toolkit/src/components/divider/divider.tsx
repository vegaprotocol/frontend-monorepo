import { forwardRef } from 'react';
import * as Separator from '@radix-ui/react-separator';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ orientation = 'horizontal', decorative }, ref) => {
    return (
      <Separator.Root
        ref={ref}
        className="bg-gs-600 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px data-[orientation=vertical]:mx-3 data-[orientation=horizontal]:my-3"
        {...{ orientation, decorative }}
      />
    );
  }
);
