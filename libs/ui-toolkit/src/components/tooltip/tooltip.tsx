import type { ReactNode } from 'react';
import React from 'react';
import {
  Provider,
  Root,
  Trigger,
  Content,
  Portal,
} from '@radix-ui/react-tooltip';
import type { ITooltipParams } from 'ag-grid-community';
import classNames from 'classnames';

const tooltipContentClasses =
  'max-w-sm bg-gs-800 border border-gs-700 px-2 py-1 z-20 rounded text-xs text-gs-0 break-word';
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
  classNames({
    'underline underline-offset-2 decoration-neutral-400 dark:decoration-neutral-400 decoration-dashed':
      underline,
  });

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
}: TooltipProps) =>
  description ? (
    <Provider delayDuration={delayDuration} skipDelayDuration={100}>
      <Root open={open}>
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
    </Provider>
  ) : (
    children
  );

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
