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
    <section className="h-full p-1">
      <div className={cn('h-full rounded-panel overflow-hidden', className)}>
        {children}
      </div>
    </section>
  );
};
