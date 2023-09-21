import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { Links } from '../../lib/links';

export const useMarketClickHandler = (replace = false) => {
  const navigate = useNavigate();

  return (selectedId: string, metaKey?: boolean) => {
    const link = Links.MARKET(selectedId);
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
