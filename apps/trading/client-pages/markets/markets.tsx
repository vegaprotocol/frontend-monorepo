import { useCallback } from 'react';
import { MarketsContainer } from '@vegaprotocol/market-list';
import { useGlobalStore } from '../../stores';
import { useNavigate } from 'react-router-dom';
import { useWelcomeNoticeDialog } from '../../components/welcome-notice';

export const Markets = () => {
  const navigate = useNavigate();
  const { update } = useGlobalStore((store) => ({ update: store.update }));
  useWelcomeNoticeDialog();
  const handleOnSelect = useCallback(
    (marketId: string) => {
      update({ marketId, welcomeNoticeDialog: false });
      navigate(`/markets/${marketId}`);
    },
    [update, navigate]
  );

  return <MarketsContainer onSelect={handleOnSelect} />;
};
