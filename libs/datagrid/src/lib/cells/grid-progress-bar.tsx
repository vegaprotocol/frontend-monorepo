import type { Intent } from '@vegaprotocol/ui-toolkit';
import { ProgressBar } from '@vegaprotocol/ui-toolkit';

export interface ValueProps {
  valueFormatted?: {
    low: string;
    high: string;
    value: number;
    intent?: Intent;
  };
}

export const EmptyCell = () => '';

export const ProgressBarCell = ({ valueFormatted }: ValueProps) => {
  return valueFormatted ? (
    <>
      <div className="flex justify-between leading-tight font-mono">
        <div>
          {valueFormatted.low} ({valueFormatted.value}%)
        </div>
      </div>
      <ProgressBar
        value={valueFormatted.value}
        intent={valueFormatted.intent}
        className="mt-2 w-full"
      />
    </>
  ) : null;
};
