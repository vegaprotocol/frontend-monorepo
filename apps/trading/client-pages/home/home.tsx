import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Splash } from '@vegaprotocol/ui-toolkit';
import { Links } from '../../pages/client-router';
import { useGlobalStore } from '../../stores';
import { useTopTradedMarkets } from '../../lib/hooks/use-top-traded-markets';

// The home pages only purpose is to redirect to the users last market,
// the top traded if they are new, or fall back to the list of markets.
// Thats why we just render a loader here
export const Home = () => {
  const navigate = useNavigate();
  const { data } = useTopTradedMarkets();
  const marketId = useGlobalStore((store) => store.marketId);

  useEffect(() => {
    if (marketId) {
      navigate(Links.MARKET(marketId), {
        replace: true,
      });
    } else if (data) {
      const marketDataId = data[0]?.id;
      if (marketDataId) {
        navigate(Links.MARKET(marketDataId), {
          replace: true,
        });
      } else {
        navigate(Links.MARKETS());
      }
    }
  }, [marketId, data, navigate]);

  return (
    <Splash>
      <Loader />
    </Splash>
  );
};
