import { FlashCell } from './flash-cell';

export interface IPriceCellProps {
  value: number | bigint | null | undefined;
  valueFormatted: string;
}

export const PriceCell = ({ value, valueFormatted }: IPriceCellProps) => {
  if (!value || isNaN(Number(value))) return <span>-</span>;
  return (
    <span className="font-mono">
      <FlashCell value={Number(value)} data-testid="price">
        {valueFormatted}
      </FlashCell>
    </span>
  );
};

PriceCell.displayName = 'PriceCell';
