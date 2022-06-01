import { gql, useQuery } from '@apollo/client';
import { LandingDialog } from '@vegaprotocol/market-list';
import { MarketTradingMode } from '@vegaprotocol/types';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import sortBy from 'lodash/sortBy';
import MarketPage from './markets/[marketId].page';
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
  if (data && !error && !loading) {
    const marketId = marketList(data)[0]?.id;
    window.history.replaceState(
      data,
      '',
      marketId ? `/markets/${marketId}` : '/markets'
    );
  }
  return (
    <>
      <LandingDialog />
      <AsyncRenderer data={data} error={error} loading={loading}>
        <MarketPage id={data && marketList(data)[0]?.id} />
      </AsyncRenderer>
    </>
  );
}

Index.getInitialProps = () => ({
  page: 'home',
});

export default Index;
