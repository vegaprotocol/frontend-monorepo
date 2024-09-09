import { type ReactNode } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import { cn } from '@vegaprotocol/ui-toolkit';

export const ResizableGrid = Allotment;
export const ResizableGridPanel = Allotment.Pane;

export const ResizableGridPanelChild = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <section className="h-full p-2">
      <div
        className={cn(
          'h-full rounded-grid overflow-hidden bg-surface-1/70',
          className
        )}
      >
        {children}
      </div>
    </section>
  );
};
