import type {
  CellRendererSelectorResult,
  ICellRendererParams,
} from 'ag-grid-community';
import { addDecimalsFormatNumber } from '@vegaprotocol/react-helpers';
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
        <div>{valueFormatted.low}</div>
        <div>{valueFormatted.high}</div>
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
    component: params.node.rowPinned ? EmptyCell : ProgressBarCell,
  };
};

export const calculateLowHighRange = (
  max: bigint,
  min: bigint,
  decimals: number,
  mid: bigint,
  intent: Intent
) => {
  const range = max > min ? max - min : max; // coloured range should stay between min max bounds.
  return {
    low: addDecimalsFormatNumber(min.toString(), decimals),
    high: addDecimalsFormatNumber(max.toString(), decimals),
    value: range ? Number(((mid - min) * BigInt(100)) / range) : 0,
    intent,
  };
};
