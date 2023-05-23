import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketsWithDataProvider } from '@vegaprotocol/markets';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Links, Routes } from '../../pages/client-router';
import { useGlobalStore } from '../../stores';

export const Home = () => {
  const navigate = useNavigate();
  // The default market selected in the platform behind the overlay
  // should be the oldest market that is currently trading in continuous mode(i.e. not in auction).
  const { data, error, loading } = useDataProvider({
    dataProvider: marketsWithDataProvider,
    variables: undefined,
  });
  const update = useGlobalStore((store) => store.update);
  const marketId = useGlobalStore((store) => store.marketId);

  useEffect(() => {
    if (marketId) {
      navigate(Links[Routes.MARKET](marketId), {
        replace: true,
      });
    } else if (data) {
      update({ shouldDisplayWelcomeDialog: true });
      const marketDataId = data[0]?.id;
      if (marketDataId) {
        navigate(Links[Routes.MARKET](marketDataId), {
          replace: true,
        });
      } else {
        navigate(Links[Routes.MARKETS]());
      }
    }
  }, [marketId, data, navigate, update]);

  return (
    <AsyncRenderer data={data} loading={loading} error={error}>
      {/* Render a loading and error state but we will redirect if markets are found */}
      {null}
    </AsyncRenderer>
  );
};
