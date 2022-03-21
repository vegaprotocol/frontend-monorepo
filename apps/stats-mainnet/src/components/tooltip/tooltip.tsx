import React from 'react';
import {
  Provider,
  Root,
  Trigger,
  Content,
  Arrow,
} from '@radix-ui/react-tooltip';

interface TooltipProps {
  children: React.ReactNode;
  description?: string;
}

// Conditionally rendered tooltip if description content is provided.
export const Tooltip = ({ children, description }: TooltipProps) =>
  description ? (
    <Provider delayDuration={200} skipDelayDuration={100}>
      <Root>
        <Trigger asChild>{children}</Trigger>
        <Content align={'start'} alignOffset={5}>
          <Arrow
            width={10}
            height={5}
            offset={10}
            className="fill-vega-green"
          />
          <div className="px-3 py-2 bg-vega-green rounded-sm max-w-sm text-sm">
            {description}
          </div>
        </Content>
      </Root>
    </Provider>
  ) : (
    <>{children}</>
  );
