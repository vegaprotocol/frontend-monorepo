import { FlashCell } from './flash-cell';

export interface AgPriceFlashCellProps {
  value: number | bigint | null | undefined;
  valueFormatted: string;
}

export const AgPriceFlashCell = ({
  value,
  valueFormatted,
}: AgPriceFlashCellProps) => {
  if ((!value && value !== 0) || isNaN(Number(value))) {
    return <span data-testid="price">-</span>;
  }
  return (
    <span className="font-mono" data-testid="price">
      <FlashCell value={Number(value)}>{valueFormatted}</FlashCell>
    </span>
  );
};

AgPriceFlashCell.displayName = 'AgPriceFlashCell';
