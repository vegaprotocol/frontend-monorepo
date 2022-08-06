import { Allotment } from 'allotment';
import type { ReactNode } from 'react';
import 'allotment/dist/style.css';

interface ResizablePanelProps {
  children: ReactNode;
  className?: string;
  defaultSizes?: Array<number>;
  maxSize?: number;
  minSize?: number;
  proportionalLayout?: boolean;
  snap?: boolean;
  vertical?: boolean;
}

export const ResizablePanel = ({
  children,
  className,
  defaultSizes,
  maxSize,
  minSize,
  proportionalLayout,
  snap,
  vertical,
}: ResizablePanelProps) => {
  return (
    <Allotment
      className={className}
      defaultSizes={defaultSizes}
      maxSize={maxSize}
      minSize={minSize}
      proportionalLayout={proportionalLayout}
      snap={snap}
      vertical={vertical}
    >
      {children}
    </Allotment>
  );
};
