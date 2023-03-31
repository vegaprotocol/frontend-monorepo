import { useCallback } from 'react';
import { MarketsContainer } from '@vegaprotocol/market-list';
import { useNavigate } from 'react-router-dom';
import { Links, Routes } from '../../pages/client-router';

export const Markets = () => {
  const navigate = useNavigate();
  const handleOnSelect = useCallback(
    (marketId: string, metaKey?: boolean) => {
      const link = Links[Routes.MARKET](marketId);
      if (metaKey) {
        window.open(`/#${link}`, '_blank');
      } else {
        navigate(link);
      }
    },
    [navigate]
  );

  return <MarketsContainer onSelect={handleOnSelect} />;
};
