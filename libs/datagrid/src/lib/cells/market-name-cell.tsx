import type { MouseEvent } from 'react';
import { useCallback } from 'react';
import get from 'lodash/get';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const MARKET_PATH = 'markets';

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
  const navigate = useNavigate();
  const id = data ? get(data, idPath ?? 'id', 'all') : '';
  const marketLink = `/#/${MARKET_PATH}/${id}`;
  const handleOnClick = useCallback(
    (ev: MouseEvent<HTMLAnchorElement>) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (onMarketClick) {
        onMarketClick(id, ev.metaKey);
        return;
      }
      if (ev.metaKey) {
        window.open(marketLink, '_blank');
      } else {
        navigate(marketLink);
      }
    },
    [marketLink, navigate, id, onMarketClick]
  );
  if (!data) return null;
  return (
    <Link to={marketLink} onClick={handleOnClick}>
      {value}
    </Link>
  );
};
