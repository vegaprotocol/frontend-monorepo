import { Tooltip } from '../tooltip';
import { StatFields } from '../../config/types';
import { GoodThresholdIndicator } from '../good-threshold-indicator';

export const defaultFieldFormatter = (field: any) =>
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
      <tr className="border border-gray-400">
        <td className="py-1 px-2">{title}</td>
        <td className="py-1 px-2 text-right">
          {formatter ? formatter(value) : defaultFieldFormatter(value)}
        </td>
        <td className="py-1 px-2">
          <GoodThresholdIndicator goodThreshold={goodThreshold} value={value} />
        </td>
      </tr>
    </Tooltip>
  );
};
