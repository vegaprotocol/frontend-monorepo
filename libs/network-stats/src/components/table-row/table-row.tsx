import { Tooltip } from '../tooltip';
import type { StatFields } from '../../config/types';
import { GoodThresholdIndicator } from '../good-threshold-indicator';

export const defaultFieldFormatter = (field: unknown) =>
  field === undefined ? 'no data' : field;

export const TableRow = ({
  title,
  formatter,
  goodThreshold,
  value,
  description,
}: StatFields) => {
  return (
    <Tooltip description={description}>
      <tr className="border">
        <td className="py-4 px-8">{title}</td>
        <td className="py-4 px-8 text-right">
          {formatter ? formatter(value) : defaultFieldFormatter(value)}
        </td>
        <td className="py-4 px-8">
          <GoodThresholdIndicator goodThreshold={goodThreshold} value={value} />
        </td>
      </tr>
    </Tooltip>
  );
};
