import type { ICellRendererParams } from 'ag-grid-community';
import { PriceCell } from './price-cell';

export interface VolProps {
  value: number | bigint | null | undefined;
  relativeValue: string;
  type: 'bid' | 'ask';
}
export interface IVolCellProps extends ICellRendererParams {
  value: number | bigint | null | undefined;
  valueFormatted: Omit<VolProps, 'value'>;
}

export const BID_COLOR = 'darkgreen';
export const ASK_COLOR = 'maroon';

export const Vol = ({ value, relativeValue, type }: VolProps) => {
  if ((!value && value !== 0) || isNaN(Number(value))) {
    return <span data-testid="vol">-</span>;
  }
  return (
    <div className="relative" data-testid="vol">
      <div
        className="h-full absolute top-0 left-0"
        style={{
          width: relativeValue,
          backgroundColor: type === 'bid' ? BID_COLOR : ASK_COLOR,
        }}
      ></div>
      <PriceCell value={value} valueFormatted={value.toString()} />
    </div>
  );
};

export const VolCell = ({ value, valueFormatted }: IVolCellProps) => (
  <Vol value={value} {...valueFormatted} />
);

VolCell.displayName = 'VolCell';
