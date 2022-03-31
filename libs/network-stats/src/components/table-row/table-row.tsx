import { Tooltip } from '@vegaprotocol/ui-toolkit';
import type { StatFields } from '../../config/types';
import { useMemo } from 'react';
import { Indicator, Variant } from '@vegaprotocol/ui-toolkit';

export const defaultFieldFormatter = (field: unknown) =>
  field === undefined ? 'no data' : field;

export const TableRow = ({
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
      <tr className="border">
        <td className="py-4 px-8">{title}</td>
        <td className="py-4 px-8 text-right">
          {formatter ? formatter(value) : defaultFieldFormatter(value)}
        </td>
        <td className="py-4 px-8">
          <Indicator variant={variant} />
        </td>
      </tr>
    </Tooltip>
  );
};
