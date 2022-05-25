import { gql, useQuery } from '@apollo/client';
import { getCurrentModal, useModalSwitcher } from '@vegaprotocol/react-helpers';
import { MarketTradingMode } from '@vegaprotocol/types';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import sortBy from 'lodash/sortBy';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
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
  const [, setModal] = useModalSwitcher();
  if (getCurrentModal() !== 'open') {
    setModal();
  }
  const { pathname, push } = useRouter();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    // conditional redirect
    if (pathname == '/') {
      // with router.push the page may be added to history
      // the browser on history back will  go back to this page and then forward again to the redirected page
      // you can prevent this behaviour using location.replace
      push(
        data
          ? `/markets/${
              marketList(data)[0]?.id
            }?portfolio=orders&trade=orderbook&chart=candles`
          : '/markets',
        undefined,
        { shallow: true }
      );
      // location.replace(
      //   data
      //     ? `/markets/${
      //         marketList(data)[0]?.id
      //       }?portfolio=orders&trade=orderbook&chart=candles`
      //     : '/markets'
      // );
    } else {
      setLoaded(true);
    }
  }, [data, pathname, push]);

  return (
    <>
      <AsyncRenderer data={data} error={error} loading={loading && loaded}>
        <MarketPage id={data && marketList(data)[0]?.id} />
      </AsyncRenderer>
    </>
  );
}

Index.getInitialProps = () => ({
  page: 'home',
});

export default Index;
