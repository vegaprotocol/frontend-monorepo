import React from 'react';
import {
  Provider,
  Root,
  Trigger,
  Content,
  Arrow,
} from '@radix-ui/react-tooltip';

interface TooltipProps {
  children: React.ReactElement;
  description?: string;
  open?: boolean;
  align?: 'start' | 'center' | 'end';
}

// Conditionally rendered tooltip if description content is provided.
export const Tooltip = ({ children, description, open, align }: TooltipProps) =>
  description ? (
    <Provider delayDuration={200} skipDelayDuration={100}>
      <Root open={open}>
        <Trigger asChild>{children}</Trigger>
        <Content align={align} alignOffset={5}>
          <Arrow
            width={10}
            height={5}
            offset={10}
            className="fill-vega-green"
          />
          <div className="px-12 py-8 bg-vega-green text-black rounded-sm max-w-sm">
            {description}
          </div>
        </Content>
      </Root>
    </Provider>
  ) : (
    children
  );
