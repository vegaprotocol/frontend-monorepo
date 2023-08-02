import type { MouseEvent, ReactNode } from 'react';
import { useCallback } from 'react';
import get from 'lodash/get';

interface MarketNameCellProps {
  value?: string | null;
  data?: { id?: string; marketId?: string; market?: { id: string } };
  idPath?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  defaultValue?: ReactNode;
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
      if (onMarketClick) {
        onMarketClick(id, ev.metaKey || ev.ctrlKey);
      }
    },
    [id, onMarketClick]
  );
  if (!value || !data) return null;
  return onMarketClick ? (
    <button onClick={handleOnClick} tabIndex={0}>
      {value}
    </button>
  ) : (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>{value}</>
  );
};
