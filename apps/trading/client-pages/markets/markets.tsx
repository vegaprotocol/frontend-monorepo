import { useCallback } from 'react';
import { MarketsContainer } from '@vegaprotocol/market-list';
import { useNavigate } from 'react-router-dom';
import { Links, Routes } from '../../pages/client-router';

export const Markets = () => {
  const navigate = useNavigate();
  const handleOnSelect = useCallback(
    (marketId: string) => {
      navigate(Links[Routes.MARKET](marketId));
    },
    [navigate]
  );

  return <MarketsContainer onSelect={handleOnSelect} />;
};
