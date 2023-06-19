import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { Links, Routes } from '../../pages/client-router';

export const useMarketClickHandler = (replace = false) => {
  const navigate = useNavigate();
  const { marketId } = useParams();
  const { pathname } = useLocation();
  const isMarketPage = pathname.match(/^\/markets\/(.+)/);
  return useCallback(
    (selectedId: string, metaKey?: boolean) => {
      const link = Links[Routes.MARKET](selectedId);
      if (metaKey) {
        window.open(`/#${link}`, '_blank');
      } else if (selectedId !== marketId || !isMarketPage) {
        navigate(link, { replace });
      }
    },
    [navigate, marketId, replace, isMarketPage]
  );
};

export const useMarketLiquidityClickHandler = () => {
  return useCallback((selectedId: string, metaKey?: boolean) => {
    window.open(`/#/liquidity/${selectedId}`, metaKey ? '_blank' : '_self');
  }, []);
};
