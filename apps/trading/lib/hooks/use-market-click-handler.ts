import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { Links, Routes } from '../../pages/client-router';

export const useMarketClickHandler = (replace = false) => {
  const navigate = useNavigate();

  return (selectedId: string, metaKey?: boolean) => {
    const link = Links[Routes.MARKET](selectedId);
    if (metaKey) {
      window.open(`/#${link}`, '_blank');
    } else {
      navigate(link, { replace });
    }
  };
};

export const useMarketLiquidityClickHandler = () => {
  return useCallback((selectedId: string, metaKey?: boolean) => {
    window.open(`/#/liquidity/${selectedId}`, metaKey ? '_blank' : '_self');
  }, []);
};

export const useClosedMarketClickHandler = (replace = false) => {
  const navigate = useNavigate();

  return (selectedId: string, metaKey?: boolean) => {
    const link = Links[Routes.CLOSED_MARKETS](selectedId);
    if (metaKey) {
      window.open(`/#${link}`, '_blank');
    } else {
      navigate(link, { replace });
    }
  };
};
