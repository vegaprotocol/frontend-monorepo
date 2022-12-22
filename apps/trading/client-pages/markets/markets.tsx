import { useCallback } from 'react';
import { MarketsContainer } from '@vegaprotocol/market-list';
import { useGlobalStore } from '../../stores';
import { useNavigate } from 'react-router-dom';
import { Links, Routes } from '../../pages/client-router';

export const Markets = () => {
  const navigate = useNavigate();
  const { update } = useGlobalStore((store) => ({ update: store.update }));
  const handleOnSelect = useCallback(
    (marketId: string) => {
      update({ marketId });
      navigate(Links[Routes.MARKET](marketId));
    },
    [update, navigate]
  );

  return <MarketsContainer onSelect={handleOnSelect} />;
};
