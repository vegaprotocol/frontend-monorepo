import { gql, useQuery } from '@apollo/client';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import orderBy from 'lodash/orderBy';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useGlobalStore } from '../stores';
import type { MarketsLanding } from './__generated__/MarketsLanding';

const MARKETS_QUERY = gql`
  query MarketsLanding {
    markets {
      id
      tradingMode
      state
      marketTimestamps {
        open
      }
    }
  }
`;

const getMarketList = ({ markets = [] }: MarketsLanding) => {
  return orderBy(markets, ['marketTimestamps.open', 'id'], ['asc', 'asc']);
};

export function Index() {
  const { replace } = useRouter();
  // The default market selected in the platform behind the overlay
  // should be the oldest market that is currently trading in continuous mode(i.e. not in auction).
  const { data, error, loading } = useQuery<MarketsLanding>(MARKETS_QUERY);
  const { vegaRiskNoticeDialog, setLandingDialog } = useGlobalStore((store) => {
    console.log(store);
    return {
      vegaRiskNoticeDialog: store.vegaRiskNoticeDialog,
      setLandingDialog: store.setLandingDialog,
    };
  });

  // console.log(riskNoticeDialog)

  useEffect(() => {
    if (data) {
      const marketId = getMarketList(data)[0]?.id;

      // If a default market is found, go to it with the landing dialog open
      if (!vegaRiskNoticeDialog && marketId) {
        setLandingDialog(true);
        replace(`/markets/${marketId}`);
      }
      // Fallback to the markets list page
      else {
        replace('/markets');
      }
    }
  }, [data, replace, vegaRiskNoticeDialog, setLandingDialog]);

  return (
    <AsyncRenderer data={data} loading={loading} error={error}>
      {/* Render a loading and error state but we will redirect if markets are found */}
      {null}
    </AsyncRenderer>
  );
}

Index.getInitialProps = () => ({
  page: 'home',
});

export default Index;
