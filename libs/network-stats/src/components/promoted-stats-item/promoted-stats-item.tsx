import { Callout, Indicator, Intent, Tooltip } from '@vegaprotocol/ui-toolkit';
import type { StatFields } from '../../config/types';
import { defaultFieldFormatter } from '../table-row';
import { useMemo } from 'react';

export const PromotedStatsItem = ({
  title,
  formatter,
  goodThreshold,
  value,
  description,
  ...props
}: StatFields) => {
  const variant = useMemo(
    () =>
      goodThreshold
        ? goodThreshold(value)
          ? Intent.Success
          : Intent.Danger
        : Intent.Primary,
    [goodThreshold, value]
  );
  return (
    <Tooltip description={description} align="start">
      <Callout>
        <div className="uppercase text-sm">
          <Indicator variant={variant} />
          <span data-testid="stats-title">{title}</span>
        </div>
        <div data-testid="stats-value" className="mt-2 text-2xl">
          {formatter ? formatter(value) : defaultFieldFormatter(value)}
        </div>
      </Callout>
    </Tooltip>
  );
};
