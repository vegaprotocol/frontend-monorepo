import { MarketsContainer } from '@vegaprotocol/market-list';
import { useGlobalStore, usePageTitleStore } from '../../stores';
import { useEffect } from 'react';
import { titlefy } from '@vegaprotocol/react-helpers';
import { useNavigate } from 'react-router-dom';

export const Markets = () => {
  const navigate = useNavigate();
  const { update } = useGlobalStore((store) => ({ update: store.update }));
  const { updateTitle } = usePageTitleStore((store) => ({
    updateTitle: store.updateTitle,
  }));
  useEffect(() => {
    updateTitle(titlefy(['Markets']));
  }, [updateTitle]);

  return (
    <MarketsContainer
      onSelect={(marketId) => {
        update({ marketId });
        navigate(`/markets/${marketId}`);
      }}
    />
  );
};
