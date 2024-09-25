import type { ComponentProps, ReactNode } from 'react';
import React from 'react';
import {
  Provider,
  Root,
  Trigger,
  Content,
  Portal,
} from '@radix-ui/react-tooltip';
import type { ITooltipParams } from 'ag-grid-community';
import { cn } from '../../utils/cn';

const tooltipContentClasses =
  'max-w-sm bg-surface-2 text-surface-2-fg border border-gs-300 dark:border-gs-700 px-2 py-1 z-20 rounded text-xs break-word';
export interface TooltipProps {
  children: React.ReactElement;
  description?: string | ReactNode;
  open?: boolean;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  alignOffset?: number;
  underline?: boolean;
  delayDuration?: number;
}

export const TOOLTIP_TRIGGER_CLASS_NAME = (underline?: boolean) =>
  cn({
    'underline underline-offset-2 decoration-gs-500 decoration-dashed':
      underline,
  });

export const TooltipProvider = (props: ComponentProps<typeof Provider>) => {
  return <Provider {...props} delayDuration={200} skipDelayDuration={100} />;
};

// Conditionally rendered tooltip if description content is provided.
export const Tooltip = ({
  children,
  description,
  open,
  sideOffset,
  alignOffset = 8,
  align = 'start',
  side = 'bottom',
  underline,
  delayDuration = 200,
}: TooltipProps) => {
  if (description) {
    return (
      <Root open={open} delayDuration={delayDuration}>
        <Trigger asChild className={TOOLTIP_TRIGGER_CLASS_NAME(underline)}>
          {children}
        </Trigger>
        {description && (
          <Portal>
            <Content
              align={align}
              side={side}
              alignOffset={alignOffset}
              className={tooltipContentClasses}
              sideOffset={sideOffset}
            >
              <div
                className="relative z-0 break-words"
                data-testid="tooltip-content"
              >
                {description}
              </div>
            </Content>
          </Portal>
        )}
      </Root>
    );
  }

  return children;
};

export const TextChildrenTooltip = ({
  children,
  ...props
}: Omit<TooltipProps, 'children'> & {
  children: string | string[];
}) => (
  <Tooltip {...props}>
    <span>{children}</span>
  </Tooltip>
);

export const TooltipCellComponent = (props: ITooltipParams) => {
  return (
    <div className={tooltipContentClasses} role="tooltip">
      {props.value}
    </div>
  );
};
