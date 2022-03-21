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
      <div className="px-6 py-4 pr-16 border border-gray-400 items-center">
        <div className="uppercase text-[0.9375rem]">
          <GoodThresholdIndicator goodThreshold={goodThreshold} value={value} />
          <span>{title}</span>
        </div>
        <div className="mt-1 text-2xl leading-none">
          {formatter ? formatter(value) : defaultFieldFormatter(value)}
        </div>
      </div>
    </Tooltip>
  );
};
