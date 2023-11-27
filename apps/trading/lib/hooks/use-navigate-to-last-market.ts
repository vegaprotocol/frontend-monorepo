import { useGlobalStore } from '../../stores';
import { useNavigate } from 'react-router-dom';
import { useTopTradedMarkets } from './use-top-traded-markets';
import { useEffect } from 'react';
import { Links } from '../links';

export const useNavigateToLastMarket = () => {
  const navigate = useNavigate();

  // this returns a list of active markets ordered by traded factor
  // hence there's no need to pull markets again or find out in separate
  // query of the state of last market
  const { data } = useTopTradedMarkets();
  const lastMarketId = useGlobalStore((store) => store.marketId);
  const isLastMarketActive = data?.some((m) => m.id === lastMarketId);

  useEffect(() => {
    if (!data) return;

    // if last market id is set and it is active, navigate to that market
    if (lastMarketId && isLastMarketActive) {
      navigate(Links.MARKET(lastMarketId), {
        replace: true,
      });
      return;
    }

    // otherwise if there's a top traded market, navigate to that market
    const marketDataId = data[0]?.id;
    if (marketDataId) {
      navigate(Links.MARKET(marketDataId), {
        replace: true,
      });
      return;
    }

    // otherwise navigate to the list of all markets
    navigate(Links.MARKETS());
  }, [lastMarketId, data, navigate, isLastMarketActive]);
};
