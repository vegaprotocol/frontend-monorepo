import { type ReactNode } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

export const ResizableGrid = Allotment;
export const ResizableGridPanel = Allotment.Pane;

export const ResizableGridPanelChild = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <section className="h-full p-0.5">
      <div className="h-full bg-surface-1 ">{children}</div>
    </section>
  );
};
