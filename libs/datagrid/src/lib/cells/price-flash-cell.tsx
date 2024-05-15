import { FlashCell } from './flash-cell';

export interface IPriceFlashCellProps {
  value: number | bigint | null | undefined;
  valueFormatted: string;
}

export const PriceFlashCell = ({
  value,
  valueFormatted,
}: IPriceFlashCellProps) => {
  if ((!value && value !== 0) || isNaN(Number(value))) {
    return <span data-testid="price">-</span>;
  }
  return (
    <span className="font-mono text-sm" data-testid="price">
      <FlashCell value={Number(value)}>{valueFormatted}</FlashCell>
    </span>
  );
};

PriceFlashCell.displayName = 'PriceFlashCell';
