import { FlashCell } from './flash-cell';

export interface IPriceCellProps {
  value: number | bigint | null | undefined;
  valueFormatted: string;
}

export const PriceCell = ({ value, valueFormatted }: IPriceCellProps) => {
  if ((!value && value !== 0) || isNaN(Number(value))) {
    return <span data-testid="price">-</span>;
  }
  return (
    <span className="font-mono" data-testid="price">
      <FlashCell value={Number(value)}>{valueFormatted}</FlashCell>
    </span>
  );
};

PriceCell.displayName = 'PriceCell';
