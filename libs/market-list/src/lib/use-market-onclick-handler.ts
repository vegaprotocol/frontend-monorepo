import { useParams, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

const MARKET_PATH = '/markets';

export const useMarketOnClickHandler = () => {
  const navigate = useNavigate();
  const { marketId } = useParams();
  return useCallback(
    (selectedId: string, metaKey?: boolean) => {
      const marketLink = `${MARKET_PATH}/${selectedId}`;
      if (metaKey) {
        window.open(`/#${marketLink}`, '_blank');
      } else if (selectedId !== marketId) {
        navigate(marketLink);
      }
    },
    [navigate, marketId]
  );
};
