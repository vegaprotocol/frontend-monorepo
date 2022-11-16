import { useCallback, useEffect } from 'react';
import {
  MarketsContainer,
  marketsWithDataProvider,
} from '@vegaprotocol/market-list';
import { useGlobalStore } from '../../stores';
import { useNavigate } from 'react-router-dom';
import { useDataProvider } from '@vegaprotocol/react-helpers';

export const Markets = () => {
  const navigate = useNavigate();
  const { data } = useDataProvider({
    dataProvider: marketsWithDataProvider,
  });
  const { update } = useGlobalStore((store) => ({ update: store.update }));
  useEffect(() => {
    if (!data) {
      update({ welcomeNoticeDialog: true });
    }
  }, [data, update]);
  const handleOnSelect = useCallback(
    (marketId: string) => {
      update({ marketId, welcomeNoticeDialog: false });
      navigate(`/markets/${marketId}`);
    },
    [update, navigate]
  );

  return <MarketsContainer onSelect={handleOnSelect} />;
};
