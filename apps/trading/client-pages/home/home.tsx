import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketsWithDataProvider } from '@vegaprotocol/market-list';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Links, Routes } from '../../pages/client-router';
import { useGlobalStore } from '../../stores';

export const Home = () => {
  const navigate = useNavigate();
  // The default market selected in the platform behind the overlay
  // should be the oldest market that is currently trading in     us mode(i.e. not in auction).
  const { data, error, loading } = useDataProvider({
    dataProvider: marketsWithDataProvider,
  });
  const { update, marketId } = useGlobalStore((store) => ({
    update: store.update,
    marketId: store.marketId,
  }));

  useEffect(() => {
    if (marketId) {
      navigate(Links[Routes.MARKET](marketId), {
        replace: true,
      });
    } else if (data) {
      const marketDataId = data[0]?.id;
      if (marketDataId) {
        navigate(Links[Routes.MARKET](marketDataId), {
          replace: true,
        });
      } else {
        navigate(Links[Routes.MARKET]());
      }
      update({ shouldDisplayWelcomeDialog: true });
    }
  }, [marketId, data, navigate, update]);

  return (
    <AsyncRenderer data={data} loading={loading} error={error}>
      {/* Render a loading and error state but we will redirect if markets are found */}
      {null}
    </AsyncRenderer>
  );
};
