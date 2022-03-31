import { Tooltip } from '@vegaprotocol/ui-toolkit';
import type { StatFields } from '../../config/types';
import { defaultFieldFormatter } from '../table-row';
import { Card, Indicator, Variant } from '@vegaprotocol/ui-toolkit';
import { useMemo } from 'react';

export const PromotedStatsItem = ({
  title,
  formatter,
  goodThreshold,
  value,
  description,
}: StatFields) => {
  const variant = useMemo(
    () =>
      goodThreshold
        ? goodThreshold(value)
          ? Variant.Success
          : Variant.Danger
        : Variant.Highlight,
    [goodThreshold, value]
  );
  return (
    <Tooltip description={description} align="start">
      <Card>
        <div className="uppercase text-[0.9375rem]">
          <Indicator variant={variant} />
          <span>{title}</span>
        </div>
        <div className="mt-4 text-h4 leading-none">
          {formatter ? formatter(value) : defaultFieldFormatter(value)}
        </div>
      </Card>
    </Tooltip>
  );
};
