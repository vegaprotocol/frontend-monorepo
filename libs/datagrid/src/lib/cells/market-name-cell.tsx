import type { MouseEvent } from 'react';
import { useCallback } from 'react';
import get from 'lodash/get';

interface MarketNameCellProps {
  value?: string;
  data?: { id?: string; marketId?: string; market?: { id: string } };
  idPath?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
}

export const MarketNameCell = ({
  value,
  data,
  idPath,
  onMarketClick,
}: MarketNameCellProps) => {
  const id = data ? get(data, idPath ?? 'id', 'all') : '';
  const handleOnClick = useCallback(
    (ev: MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();
      ev.stopPropagation();
      console.log('onMarketClick', onMarketClick);
      if (onMarketClick) {
        onMarketClick(id, ev.metaKey);
      }
    },
    [id, onMarketClick]
  );
  if (!data) return null;
  return (
    <button onClick={handleOnClick} tabIndex={0}>
      {value}
    </button>
  );
};
