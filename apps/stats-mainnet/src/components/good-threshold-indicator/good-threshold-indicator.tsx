import { value, goodThreshold } from '../../config/types';

interface GoodThresholdIndicatorProps {
  goodThreshold: goodThreshold | undefined;
  value: value;
}

export const GoodThresholdIndicator = ({
  goodThreshold,
  value,
}: GoodThresholdIndicatorProps) => {
  return (
    <div
      className={`inline-block w-8 h-8 mb-[0.15rem] mr-8 rounded ${
        (goodThreshold &&
          (goodThreshold(value) ? 'bg-intent-success' : 'bg-intent-danger')) ||
        'bg-current'
      }`}
    />
  );
};
