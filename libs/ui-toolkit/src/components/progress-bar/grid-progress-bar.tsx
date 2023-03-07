import type {
  CellRendererSelectorResult,
  ICellRendererParams,
} from 'ag-grid-community';
import type { Intent } from '../../utils/intent';
import { ProgressBar } from './progress-bar';

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
          {valueFormatted.low} ({valueFormatted.value?.toFixed(2)})%
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

export const progressBarCellRendererSelector = (
  params: ICellRendererParams
): CellRendererSelectorResult => {
  return {
    component: ProgressBarCell,
  };
};
