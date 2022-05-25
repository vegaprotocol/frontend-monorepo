import { gql, useQuery } from '@apollo/client';
import { getCurrentModal, useModalSwitcher } from '@vegaprotocol/react-helpers';
import { MarketTradingMode } from '@vegaprotocol/types';
import sortBy from 'lodash/sortBy';
import { useRouter } from 'next/router';
import type { MarketsLanding } from './__generated__/MarketsLanding';

const MARKETS_QUERY = gql`
  query MarketsLanding {
    markets {
      id
      tradingMode
      marketTimestamps {
        open
      }
    }
  }
`;

const marketList = ({ markets }: MarketsLanding) =>
  sortBy(
    markets?.filter(
      ({ marketTimestamps, tradingMode }) =>
        marketTimestamps.open && tradingMode === MarketTradingMode.Continuous
    ) || [],
    'marketTimestamps.open',
    'id'
  );

export function Index() {
  // The default market selected in the platform behind the overlay
  // should be the oldest market that is currently trading in continuous mode(i.e. not in auction).
  const { data, error, loading } = useQuery<MarketsLanding>(MARKETS_QUERY);
  const [, setModal] = useModalSwitcher();
  const { push } = useRouter();
  if (getCurrentModal() !== 'open') {
    setModal();
  }
  if (data && !loading && !error) {
    const marketId = marketList(data)[0]?.id;
    push(
      marketId
        ? `/markets/${marketId}?portfolio=orders&trade=orderbook&chart=candles`
        : '/markets'
    );
  }
  return null;
}


Index.getInitialProps = () => ({
  page: 'home',
});

export default Index;
