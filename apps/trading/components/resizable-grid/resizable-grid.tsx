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
    <section className="h-full p-1">
      <div className="h-full bg-vega-clight-800 dark:bg-vega-cdark-800">
        {children}
      </div>
    </section>
  );
};
