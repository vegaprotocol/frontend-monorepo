import type { ICellRendererParams } from 'ag-grid-community';
import { PriceCell } from './price-cell';

export interface IVolCellProps extends ICellRendererParams {
  value: number | bigint | null | undefined;
  valueFormatted: {
    vol: string;
    relativeVol: number;
    type: 'bid' | 'ask';
  };
}

export const BID_COLOR = 'darkgreen';
export const ASK_COLOR = 'maroon';

export const VolCell = ({ value, valueFormatted }: IVolCellProps) => {
  if ((!value && value !== 0) || isNaN(Number(value))) {
    return <span data-testid="vol">-</span>;
  }
  return (
    <div className="relative" data-testid="vol">
      <div
        className="h-full absolute top-0 left-0"
        style={{
          width: `${valueFormatted.relativeVol * 100}%`,
          backgroundColor:
            valueFormatted.type === 'bid' ? BID_COLOR : ASK_COLOR,
        }}
      ></div>
      <PriceCell value={value} valueFormatted={valueFormatted.vol} />
    </div>
  );
};

VolCell.displayName = 'VolCell';
