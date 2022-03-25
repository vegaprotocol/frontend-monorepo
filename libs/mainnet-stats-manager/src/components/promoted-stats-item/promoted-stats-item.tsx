import { Tooltip } from '../tooltip';
import { StatFields } from '../../config/types';
import { defaultFieldFormatter } from '../table-row';
import { GoodThresholdIndicator } from '../good-threshold-indicator';

export const PromotedStatsItem = ({
  title,
  formatter,
  goodThreshold,
  value,
  description,
}: StatFields) => {
  return (
    <Tooltip description={description}>
      <div className="px-24 py-16 pr-64 border items-center">
        <div className="uppercase text-[0.9375rem]">
          <GoodThresholdIndicator goodThreshold={goodThreshold} value={value} />
          <span>{title}</span>
        </div>
        <div className="mt-4 text-h4 leading-none">
          {formatter ? formatter(value) : defaultFieldFormatter(value)}
        </div>
      </div>
    </Tooltip>
  );
};
