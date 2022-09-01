import { Tooltip } from '@vegaprotocol/ui-toolkit';
import type { StatFields } from '../../config/types';
import { useMemo } from 'react';
import { Indicator, Intent } from '@vegaprotocol/ui-toolkit';

export const defaultFieldFormatter = (field: unknown) =>
  field === undefined ? 'no data' : field;

export const TableRow = ({
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
        : Intent.None,
    [goodThreshold, value]
  );
  return (
    <Tooltip description={description} align="start">
      <tr className="border border-black dark:border-white">
        <td data-testid="stats-title" className="py-2 px-4">
          {title}
        </td>
        <td data-testid="stats-value" className="py-2 px-4 text-right">
          {formatter ? formatter(value) : defaultFieldFormatter(value)}
        </td>
        <td className="py-2 px-4">
          <Indicator variant={variant} />
        </td>
      </tr>
    </Tooltip>
  );
};
